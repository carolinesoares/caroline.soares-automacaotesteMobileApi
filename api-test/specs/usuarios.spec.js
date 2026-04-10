'use strict';

const { expect } = require('chai');
const { createClient, userPayload, uniqueEmail } = require('../helpers/client');

describe('GET /usuarios', () => {
  it('retorna 200 e lista com estrutura quantidade + usuarios', async () => {
    const api = createClient();
    const res = await api.get('/usuarios');

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('quantidade');
    expect(res.data).to.have.property('usuarios');
    expect(res.data.usuarios).to.be.an('array');
  });

  it('aceita filtro por email (query) quando informado', async () => {
    const api = createClient();
    const body = userPayload();
    const create = await api.post('/usuarios', body);
    expect(create.status).to.equal(201);

    const res = await api.get('/usuarios', { params: { email: body.email } });

    expect(res.status).to.equal(200);
    expect(res.data.usuarios.some((u) => u.email === body.email)).to.equal(true);
  });
});

describe('POST /usuarios', () => {
  it('retorna 201 e _id quando o corpo é válido', async () => {
    const api = createClient();
    const body = userPayload();
    const res = await api.post('/usuarios', body);

    expect(res.status).to.equal(201);
    expect(res.data).to.have.property('message', 'Cadastro realizado com sucesso');
    expect(res.data).to.have.property('_id');
  });

  it('retorna 400 quando o email já está em uso', async () => {
    const api = createClient();
    const body = userPayload();
    const first = await api.post('/usuarios', body);
    expect(first.status).to.equal(201);

    const res = await api.post('/usuarios', { ...body, nome: 'Outro nome' });

    expect(res.status).to.equal(400);
    expect(res.data).to.have.property('message', 'Este email já está sendo usado');
  });

  it('retorna 400 quando campo obrigatório está ausente', async () => {
    const api = createClient();
    const res = await api.post('/usuarios', {
      nome: 'Só nome',
      password: 'x',
      administrador: 'false',
    });

    expect(res.status).to.equal(400);
    expect(res.data).to.have.property('email');
  });
});

describe('GET /usuarios/{_id}', () => {
  it('retorna 200 e dados do usuário quando o id existe', async () => {
    const api = createClient();
    const body = userPayload();
    const created = await api.post('/usuarios', body);
    expect(created.status).to.equal(201);
    const id = created.data._id;

    const res = await api.get(`/usuarios/${id}`);

    expect(res.status).to.equal(200);
    expect(res.data).to.include({
      nome: body.nome,
      email: body.email,
      administrador: body.administrador,
    });
    expect(res.data).to.have.property('_id', id);
  });

  it('retorna 400 quando o usuário não existe', async () => {
    const api = createClient();
    // A API exige _id com 16 caracteres alfanuméricos para busca; caso contrário valida o formato.
    const res = await api.get('/usuarios/aaaaaaaaaaaaaaaa');

    expect(res.status).to.equal(400);
    expect(res.data).to.have.property('message', 'Usuário não encontrado');
  });
});

describe('PUT /usuarios/{_id}', () => {
  it('retorna 200 ao atualizar usuário existente', async () => {
    const api = createClient();
    const body = userPayload();
    const created = await api.post('/usuarios', body);
    const id = created.data._id;
    const novoEmail = uniqueEmail();

    const res = await api.put(`/usuarios/${id}`, {
      nome: 'Nome Atualizado',
      email: novoEmail,
      password: 'novaSenha456',
      administrador: 'false',
    });

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('message', 'Registro alterado com sucesso');

    const get = await api.get(`/usuarios/${id}`);
    expect(get.data.email).to.equal(novoEmail);
    expect(get.data.nome).to.equal('Nome Atualizado');
  });

  it('retorna 201 cadastro quando o _id não existe (comportamento da API)', async () => {
    const api = createClient();
    // ID com 16 caracteres que não correspondem a um usuário → novo cadastro (Swagger).
    const fakeId = 'bbbbbbbbbbbbbbbb';
    const novoEmail = uniqueEmail();

    const res = await api.put(`/usuarios/${fakeId}`, {
      nome: 'Criado via PUT',
      email: novoEmail,
      password: 'p',
      administrador: 'false',
    });

    expect(res.status).to.equal(201);
    expect(res.data).to.have.property('message', 'Cadastro realizado com sucesso');
    expect(res.data).to.have.property('_id');
  });

  it('retorna 400 ao tentar email já utilizado por outro usuário', async () => {
    const api = createClient();
    const a = userPayload();
    const b = userPayload();
    const r1 = await api.post('/usuarios', a);
    const r2 = await api.post('/usuarios', b);
    expect(r1.status).to.equal(201);
    expect(r2.status).to.equal(201);

    const res = await api.put(`/usuarios/${r2.data._id}`, {
      nome: 'Tentativa',
      email: a.email,
      password: 'x',
      administrador: 'false',
    });

    expect(res.status).to.equal(400);
    expect(res.data).to.have.property('message', 'Este email já está sendo usado');
  });
});

describe('DELETE /usuarios/{_id}', () => {
  it('retorna 200 e remove o usuário quando não há carrinho associado', async () => {
    const api = createClient();
    const body = userPayload();
    const created = await api.post('/usuarios', body);
    const id = created.data._id;

    const res = await api.delete(`/usuarios/${id}`);

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('message', 'Registro excluído com sucesso');

    const get = await api.get(`/usuarios/${id}`);
    expect(get.status).to.equal(400);
  });
});

describe('Fluxo JWT (login)', () => {
  it('token obtido em /login pode ser usado em requisições autenticadas', async () => {
    const api = createClient();
    const body = userPayload({ administrador: 'true' });
    await api.post('/usuarios', body);

    const login = await api.post('/login', {
      email: body.email,
      password: body.password,
    });
    expect(login.status).to.equal(200);

    const token = login.data.authorization;
    const authed = createClient(token);
    const produto = {
      nome: `Produto Teste ${Date.now()}`,
      preco: 10,
      descricao: 'item',
      quantidade: 1,
    };
    const postProd = await authed.post('/produtos', produto);

    expect(postProd.status).to.equal(201);
  });
});
