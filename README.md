# Automação mobile — native-demo-app (WebdriverIO + Appium)

Projeto de testes end-to-end para o aplicativo **[webdriverio/native-demo-app](https://github.com/webdriverio/native-demo-app)** (v2.2.0), alinhado ao desafio de automação mobile: JavaScript, WebdriverIO, Appium, Mocha, Chai, Allure e GitLab CI.

## Testes de API (desafio — ServeRest)

O PDF do desafio descreve recursos em inglês (`GET /users`, …). A API sugerida na documentação é o **[ServeRest](https://serverest.dev)** (`/usuarios`, `/login`, …), com autenticação JWT e limite de **100 requisições por minuto** (os testes executam em sequência e ficam abaixo desse limite).

**Stack:** Mocha, Chai, Axios, **Allure** (via `allure-mocha` → pasta `allure-results/`) e, no CI ou quando quiseres HTML separado, **Mochawesome** (`artifacts/api-report/index.html`).

### Execução local

```bash
npm ci
npm run test:api
```

Os testes de API passam a gravar resultados Allure em **`allure-results/`** (o mesmo formato que o WebdriverIO). Para ver o relatório juntamente com os testes mobile, corre antes ou depois os E2E e depois:

```bash
npm run allure:generate
npm run allure:open
# ou: npx allure serve allure-results
```

Relatório HTML **Mochawesome** (opcional, inclui também Allure na mesma corrida):

```bash
npm run test:api:ci
# Abrir: artifacts/api-report/index.html
```

Variável opcional: `API_BASE_URL` (por defeito `https://serverest.dev`).

### Casos cobertos (resumo)

| Área | Cenários |
|------|----------|
| `POST /login` | Login com sucesso (token `Bearer`), credenciais inválidas (401) |
| `GET /usuarios` | Lista (`quantidade` + `usuarios`), filtro por `email` |
| `POST /usuarios` | Cadastro válido (201), email duplicado (400), validação de campo obrigatório |
| `GET /usuarios/{_id}` | Usuário existente (200), não encontrado (400) |
| `PUT /usuarios/{_id}` | Alteração (200), cadastro quando não existe `_id` (201), email duplicado (400) |
| `DELETE /usuarios/{_id}` | Exclusão com sucesso (200) e verificação pós-delete |
| JWT | Token do login usado em rota protegida (`POST /produtos` como administrador) |

Ficheiros: `api-test/` (configuração em `api-test/config.js`, `api-test/helpers/client.js`, especificações em `api-test/specs/`).

### CI (GitLab)

O job **`api_tests`** publica **`allure-results/`** (Allure) e **`artifacts/api-report/`** (Mochawesome).

## Pré-requisitos locais

- Node.js 20+
- Appium 2.x instalado globalmente (`npm i -g appium`) e drivers:
  - `appium driver install uiautomator2`
  - `appium driver install xcuitest`
- Android Studio (emulador Android) e/ou Xcode (simulador iOS)
- Variáveis de ambiente Android (`ANDROID_HOME`) quando for executar Android

## Instalação

```bash
npm ci
```

## Binários do aplicativo

Coloque os artefatos da [release v2.2.0](https://github.com/webdriverio/native-demo-app/releases/tag/v2.2.0) na pasta `apps/`:

- **Android:** `android.wdio.native.app.v2.2.0.apk`
- **iOS (simulador):** `ios.simulator.wdio.native.app.v2.2.0.zip` **ou** a pasta `.app` extraída (por exemplo `apps/wdiodemoapp.app`, como no bundle da release).

O `wdio.ios.conf.js` usa por defeito **`wdiodemoapp.app`** se existir em `apps/`; caso contrário, tenta o **`.zip`**. Podes forçar um caminho com `IOS_APP_PATH`.

Variáveis opcionais para caminhos customizados:

- `ANDROID_APP_PATH` — caminho absoluto para o `.apk`
- `IOS_APP_PATH` — caminho absoluto para o `.app` ou `.zip` do simulador

Ajuste também o nome/versão do dispositivo virtual:

- Android: `ANDROID_DEVICE_NAME` (por defeito **`emulator-5554`** — confirma com `adb devices`), `ANDROID_PLATFORM_VERSION` (opcional)
- iOS: `IOS_DEVICE_NAME`, `IOS_PLATFORM_VERSION` (por defeito no projeto: **iPhone 17** + **26.4**, alinhado ao simulador local comum em Xcode recente)

### Android (emulador)

1. Instala o APK uma vez no AVD (arrastar para o emulador, ou `adb install apps/android.wdio.native.app.v2.2.0.apk`).
2. Corre os testes **sem reinstalar** (comportamento por defeito): `appPackage` / `appActivity` + `noReset: true`.
3. Para forçar instalação via Appium nessa corrida:  
   `export ANDROID_APP_PATH="$PWD/apps/android.wdio.native.app.v2.2.0.apk"` e corre `npm run test:android`.  
   Opcional: `ANDROID_NO_RESET_WITH_APK=1` mantém dados após instalar por cima.

Appium **UiAutomator2** tem de estar instalado: `appium driver install uiautomator2`.

## Execução

```bash
# Android (padrão npm test)
npm run test:android

# iOS (executa login → forms → navegação em sequência para um só simulador)
npm run test:ios
```

### BrowserStack (opcional)

1. Envie o `.apk` para o BrowserStack e copie a URL `bs://...`.
2. Exporte:

```bash
export BROWSERSTACK_USERNAME="..."
export BROWSERSTACK_ACCESS_KEY="..."
export BROWSERSTACK_APP_URL="bs://..."
npm run test:bs
```

Opcional: `BS_ANDROID_DEVICE`, `BS_ANDROID_VERSION`, `BROWSERSTACK_BUILD_NAME`, `BROWSERSTACK_SESSION_NAME`.

## Estrutura dos testes

- **Page Object:** `test/pageobjects/` e `test/pageobjects/components/`
- **10 cenários** em `test/specs/` (login/cadastro, erros de validação, navegação, formulário, dropdown data-driven com JSON)
- **Dados:** `test/data/login-credentials.json`, `test/data/dropdown-options.json`

## Evidências (Allure)

- **Mobile (WebdriverIO):** em falhas, screenshots em `artifacts/screenshots/` e anexos no Allure.
- **API (Mocha):** cada teste gera casos em `allure-results/` via `allure-mocha`; aparecem no mesmo relatório se gerares depois de correr `npm run test:api` e os E2E.

```bash
npm run allure:generate
npm run allure:open
```

## CI/CD (GitLab)

O ficheiro `.gitlab-ci.yml` inclui:

- Job **`api_tests`** — testes de API ServeRest + artefactos `allure-results/` e `artifacts/api-report/`
- Job **e2e_browserstack_android** quando `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY` estão definidos
- Job manual **e2e_android_local_emulator** (exemplo com download do APK; requer runner com emulador/Appium)

Pipelines em merge request e na branch principal (`workflow.rules` no YAML).

## Licença

ISC (conforme `package.json`).
