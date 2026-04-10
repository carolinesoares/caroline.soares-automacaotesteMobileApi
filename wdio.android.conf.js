const path = require('node:path');
const shared = require('./wdio.shared.conf.js').config;

/**
 * Modo habitual: app já instalada no emulador (noReset + appPackage/appActivity).
 * Primeira instalação ou reinstalar: exporte ANDROID_APP_PATH=/caminho/para/app.apk
 *
 * Emulador referência (swipe carrossel): 1080×1920, density 420 — ver SwipeScreen.js
 * ANDROID_CAROUSEL_* / ANDROID_SWIPE_* / ANDROID_FLING_* ; ANDROID_CAROUSEL_SKIP_VERTICAL_NUDGE=1
 * se só quiseres horizontal. Ver test/pageobjects/SwipeScreen.js.
 */
const capabilities = [
  {
    platformName: 'Android',
    'wdio:maxInstances': 1,
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
    'appium:automationName': 'UiAutomator2',
    'appium:orientation': 'PORTRAIT',
    'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'com.wdiodemoapp',
    'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || 'com.wdiodemoapp.MainActivity',
    'appium:appWaitActivity': '*',
    'appium:noReset': process.env.ANDROID_FULL_RESET === '1' ? false : true,
    'appium:newCommandTimeout': 240,
  },
];

if (process.env.ANDROID_PLATFORM_VERSION) {
  capabilities[0]['appium:platformVersion'] = process.env.ANDROID_PLATFORM_VERSION;
}

if (process.env.ANDROID_APP_PATH) {
  capabilities[0]['appium:app'] = process.env.ANDROID_APP_PATH;
  if (process.env.ANDROID_NO_RESET_WITH_APK === '1') {
    capabilities[0]['appium:noReset'] = true;
  } else {
    capabilities[0]['appium:noReset'] = false;
  }
}

exports.config = {
  ...shared,
  services: [
    [
      'appium',
      {
        command: 'appium',
        args: {
          relaxedSecurity: true,
        },
        logPath: path.resolve(__dirname, 'artifacts', 'logs'),
      },
    ],
  ],
  capabilities,
  beforeSession(_config, caps) {
    // eslint-disable-next-line no-console
    console.log('[INFO] Starting Android session');
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(caps, null, 2));
  },
};
