'use strict';

const axios = require('axios');
const config = require('../config');

/**
 * Cliente HTTP com baseURL configurável.
 * @param {string} [authorization] Valor completo do header Authorization (ex.: "Bearer …")
 */
function createClient(authorization) {
  const headers = { 'Content-Type': 'application/json' };
  if (authorization) {
    headers.Authorization = authorization;
  }
  return axios.create({
    baseURL: config.baseUrl,
    headers,
    validateStatus: () => true,
  });
}

function uniqueEmail() {
  return `api.${Date.now()}.${Math.random().toString(36).slice(2, 9)}@qa.com.br`;
}

function userPayload(overrides = {}) {
  return {
    nome: 'Usuário Automação',
    email: uniqueEmail(),
    password: 'senhaSegura123',
    administrador: 'true',
    ...overrides,
  };
}

module.exports = { createClient, uniqueEmail, userPayload };
