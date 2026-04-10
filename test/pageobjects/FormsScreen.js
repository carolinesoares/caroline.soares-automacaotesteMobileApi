const AppScreen = require('./AppScreen');

const SELECTORS = {
  SCREEN: '~Forms-screen',
};

class FormsScreen extends AppScreen {
  constructor() {
    super(SELECTORS.SCREEN);
  }

  get screen() {
    return $(SELECTORS.SCREEN);
  }

  get input() {
    return $('~text-input');
  }

  get inputTextResult() {
    return $('~input-text-result');
  }

  get switchEl() {
    return $('~switch');
  }

  get switchText() {
    return $('~switch-text');
  }

  get dropDown() {
    return $('~Dropdown');
  }

  get dropDownChevron() {
    return $('~dropdown-chevron');
  }

  get activeButton() {
    return $('~button-Active');
  }

  get inActiveButton() {
    return $('~button-Inactive');
  }

  async tapOnInputTextResult() {
    await this.inputTextResult.click();
  }

  async tapOnSwitch() {
    await this.switchEl.click();
  }

  async tapOnDropDown() {
    if (driver.isIOS) {
      await this.dropDownChevron.click();
    } else {
      await this.dropDown.click();
    }
  }

  async tapOnActiveButton() {
    await this.activeButton.click();
  }

  async tapOnInActiveButton() {
    await this.inActiveButton.click();
  }

  async isSwitchActive() {
    return driver.isAndroid
      ? (await this.switchEl.getAttribute('checked')) === 'true'
      : (await this.switchEl.getText()) === '1';
  }

  async getDropDownText() {
    const selector = driver.isAndroid
      ? '//*[@content-desc="Dropdown"]//android.widget.EditText'
      : '-ios class chain:**/*[`name == "Dropdown"`]/**/*[`name == "text_input"`]';
    return $(selector).getText();
  }
}

module.exports = new FormsScreen();
