const SELECTORS = {
  ANDROID: {
    ALERT_TITLE: '*//android.widget.TextView[@resource-id="com.wdiodemoapp:id/alert_title"]',
    ALERT_MESSAGE: '*//android.widget.TextView[@resource-id="android:id/message"]',
    ALERT_BUTTON: '*//android.widget.Button[@text="{BUTTON_TEXT}"]',
  },
  IOS: {
    ALERT: '-ios predicate string:type == \'XCUIElementTypeAlert\'',
  },
};

class NativeAlert {
  static async waitForIsShown(isShown = true) {
    const selector = driver.isAndroid ? SELECTORS.ANDROID.ALERT_TITLE : SELECTORS.IOS.ALERT;
    await $(selector).waitForExist({ timeout: 20000, reverse: !isShown });
  }

  /**
   * @param {string} label texto do botão como aparece na UI (Android vira maiúsculas no XPath)
   */
  static async tapOnButtonWithText(label) {
    const buttonSelector = driver.isAndroid
      ? SELECTORS.ANDROID.ALERT_BUTTON.replace(/{BUTTON_TEXT}/, label.toUpperCase())
      : `~${label}`;
    await $(buttonSelector).click();
  }

  static async text() {
    if (driver.isIOS) {
      return $(SELECTORS.IOS.ALERT).getText();
    }
    const title = await $(SELECTORS.ANDROID.ALERT_TITLE).getText();
    const message = await $(SELECTORS.ANDROID.ALERT_MESSAGE).getText();
    return `${title}\n${message}`;
  }
}

module.exports = NativeAlert;
