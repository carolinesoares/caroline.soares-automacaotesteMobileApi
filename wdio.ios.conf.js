const fs = require('node:fs');
const path = require('node:path');
const shared = require('./wdio.shared.conf.js').config;

const appBundle = path.join(process.cwd(), 'apps', 'wdiodemoapp.app');
const appZip = path.join(process.cwd(), 'apps', 'ios.simulator.wdio.native.app.v2.2.0.zip');

const APP =
  process.env.IOS_APP_PATH ||
  (fs.existsSync(appBundle) ? appBundle : appZip);

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
        logPath: './artifacts/logs/appium-service.log',
      },
    ],
  ],
  capabilities: [
    {
      platformName: 'iOS',
      'wdio:maxInstances': 1,
      'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone 17',
      'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '26.4',
      'appium:orientation': 'PORTRAIT',
      'appium:automationName': 'XCUITest',
      'appium:app': APP,
      'appium:newCommandTimeout': 240,
      'appium:webviewConnectTimeout': 20000,
      'appium:additionalWebviewBundleIds': ['*'],
      'appium:maxTypingFrequency': 30,
    },
  ],
};
