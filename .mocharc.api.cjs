'use strict';

/** Configuração Mocha apenas para testes de API (ServeRest). Repórters: ver scripts `test:api*` no package.json. */
module.exports = {
  timeout: 30000,
  slow: 5000,
  spec: ['api-test/specs/**/*.spec.js'],
};
