const SELECTORS = {
  ANDROID_LISTVIEW: '//android.widget.ListView',
  IOS_PICKERWHEEL: '-ios predicate string:type == \'XCUIElementTypePickerWheel\'',
  DONE: '~done_button',
};

class Picker {
  static async waitForIsShown(isShown = true) {
    const selector = driver.isIOS ? SELECTORS.IOS_PICKERWHEEL : SELECTORS.ANDROID_LISTVIEW;
    await $(selector).waitForExist({ timeout: 11000, reverse: !isShown });
  }

  static async selectValue(value) {
    await this.waitForIsShown(true);
    if (driver.isIOS) {
      await $(SELECTORS.IOS_PICKERWHEEL).addValue(value);
      await $(SELECTORS.DONE).click();
    } else {
      await $(`${SELECTORS.ANDROID_LISTVIEW}/*[@text='${value}']`).click();
    }
    await this.waitForIsShown(false);
  }
}

module.exports = Picker;
