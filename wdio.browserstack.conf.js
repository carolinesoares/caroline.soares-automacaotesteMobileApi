try {
  require('dotenv').config();
} catch {
  /* dotenv opcional */
}

const shared = require('./wdio.shared.conf.js').config;

const user = process.env.BROWSERSTACK_USERNAME;
const key = process.env.BROWSERSTACK_ACCESS_KEY;

if (!user || !key) {
  throw new Error(
    'BrowserStack: falta BROWSERSTACK_USERNAME ou BROWSERSTACK_ACCESS_KEY.\n' +
      'Cria `.env` na raiz a partir de `.env.example` ou exporta as variáveis antes de `npm run test:bs`.',
  );
}

/** URL do app após upload no BrowserStack (App Live / App Automate). */
const app =
  process.env.BROWSERSTACK_APP_URL ||
  'bs://09e3299753d73122dd9e0f7a888af9a367dbfa68';

const projectName = process.env.BROWSERSTACK_PROJECT_NAME || 'native-demo-app';
const buildName =
  process.env.BROWSERSTACK_BUILD_NAME ||
  process.env.CI_COMMIT_REF_NAME ||
  'wdio-browserstack';

/**
 * BROWSERSTACK_MATRIX=1 — três dispositivos em paralelo (mais minutos na conta BS).
 * Sem isso: um único dispositivo (Pixel 8 Pro por defeito), alinhado ao maxInstances local.
 */
const useMatrix = process.env.BROWSERSTACK_MATRIX === '1';

const deviceTuples = useMatrix
  ? [
      ['Samsung Galaxy S22 Ultra', '12.0'],
      ['Google Pixel 8 Pro', '14.0'],
      ['OnePlus 11R', '13.0'],
    ]
  : [
      [
        process.env.BS_ANDROID_DEVICE || 'Google Pixel 8 Pro',
        process.env.BS_ANDROID_VERSION || '14.0',
      ],
    ];

function androidCapability(deviceName, platformVersion, idx) {
  const sessionName =
    process.env.BROWSERSTACK_SESSION_NAME ||
    `${deviceName.split(' ').slice(0, 2).join(' ')}-${idx}`;

  return {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    // `app` não pode ir dentro de bstack:options (schema W3C do hub)
    'appium:app': app,
    'bstack:options': {
      projectName,
      buildName,
      sessionName,
      deviceName,
      platformVersion,
      debug: true,
      networkLogs: true,
    },
  };
}

exports.config = {
  ...shared,
  user,
  key,
  protocol: 'https',
  hostname: 'hub.browserstack.com',
  port: 443,
  // App Automate: o endpoint correcto é /wd/hub (path `/` devolve 404 e "Session not started")
  path: '/wd/hub',
  services: [],
  maxInstances: useMatrix ? deviceTuples.length : 1,
  capabilities: deviceTuples.map(([name, ver], i) => androidCapability(name, ver, i)),
};
