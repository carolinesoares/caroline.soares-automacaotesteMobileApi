const path = require('node:path');
const fs = require('node:fs');
const allure = require('@wdio/allure-reporter').default;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts');
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');
const LOGS_DIR = path.join(ARTIFACTS_DIR, 'logs');

ensureDir(SCREENSHOTS_DIR);
ensureDir(LOGS_DIR);

exports.config = {
  runner: 'local',
  /** Um único worker: um simulador/dispositivo não suporta várias sessões Appium em paralelo. */
  maxInstances: 1,
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    require: ['./test/helpers/chai-setup.js'],
  },

  specs: ['./test/specs/**/*.spec.js'],

  logLevel: 'info',
  waitforTimeout: 20000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 2,

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  before: async function () {
    try {
      if (browser.isAndroid) {
        await browser.updateSettings({ waitForSelectorTimeout: 3000 });
      }
    } catch (e) {
      // ignore
    }

    try {
      const caps = await browser.getCapabilities();
      const c = caps.capabilities || caps;
      allure.addEnvironment('platformName', String(c.platformName ?? ''));
      allure.addEnvironment('device', String(c['appium:deviceName'] ?? c.deviceName ?? ''));
      allure.addEnvironment(
        'platformVersion',
        String(c['appium:platformVersion'] ?? c.platformVersion ?? ''),
      );
      allure.addEnvironment('automationName', String(c['appium:automationName'] ?? ''));
      allure.addEnvironment('Node', process.version);
    } catch (e) {
      // ignore
    }
  },

  /**
   * Evidências:
   * - screenshot no final de cada teste (Allure + artifacts/screenshots) — pass ou fail
   * - em falha: anexos extra (capabilities, meta, stack)
   */
  afterTest: async function (test, context, { error, passed }) {
    const ts = new Date().toISOString().replaceAll(':', '-');
    const safeTitle = String(test.title || 'test')
      .replaceAll(/[^\w\d\-_. ]+/g, '')
      .trim()
      .replaceAll(' ', '_')
      .slice(0, 120);

    const filename = `${ts}__${safeTitle}__${passed ? 'pass' : 'fail'}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    try {
      await browser.saveScreenshot(filepath);
      allure.addAttachment('Screenshot (final do teste)', fs.readFileSync(filepath), 'image/png');
    } catch (e) {
      // sessão já terminou (ex.: teardown)
    }

    if (passed) {
      return;
    }

    try {
      const caps = await browser.getCapabilities();
      allure.addAttachment('Capabilities', JSON.stringify(caps, null, 2), 'application/json');
    } catch (e) {}

    try {
      const meta = {
        sessionId: browser.sessionId,
      };
      const logFile = path.join(LOGS_DIR, `${ts}__${safeTitle}.json`);
      fs.writeFileSync(logFile, JSON.stringify(meta, null, 2));
      allure.addAttachment('Execução (meta)', JSON.stringify(meta, null, 2), 'application/json');
    } catch (e) {}

    if (error) {
      allure.addAttachment('Erro', String(error && error.stack ? error.stack : error), 'text/plain');
    }
  },
};

