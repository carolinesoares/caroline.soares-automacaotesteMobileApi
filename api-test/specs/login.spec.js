'use strict';

const { expect } = require('chai');
const { createClient, userPayload } = require('../helpers/client');

describe('POST /login', () => {
  let email;
  let password;

  before(async () => {
    const api = createClient();
    const body = userPayload({ administrador: 'false' });
    email = body.email;
    password = body.password;
    const res = await api.post('/usuarios', body);
    expect(res.status).to.equal(201);
  });

  it('retorna 200 e token JWT quando credenciais são válidas', async () => {
    const api = createClient();
    const res = await api.post('/login', { email, password });

    expect(res.status).to.equal(200);
    expect(res.data).to.have.property('message', 'Login realizado com sucesso');
    expect(res.data).to.have.property('authorization');
    expect(res.data.authorization).to.match(/^Bearer\s+\S+/);
  });

  it('retorna 401 quando email ou senha estão incorretos', async () => {
    const api = createClient();
    const res = await api.post('/login', {
      email,
      password: 'senha_errada_' + Date.now(),
    });

    expect(res.status).to.equal(401);
    expect(res.data).to.have.property('message');
  });
});
