const AppScreen = require('./AppScreen');
const { ensureElementVisible } = require('../helpers/ensureVisible');

const SELECTORS = {
  SCREEN: '~Login-screen',
};

class LoginScreen extends AppScreen {
  constructor() {
    super(SELECTORS.SCREEN);
  }

  get screen() {
    return $(SELECTORS.SCREEN);
  }

  get loginContainerButton() {
    return $('~button-login-container');
  }

  get signUpContainerButton() {
    return $('~button-sign-up-container');
  }

  get loginButton() {
    return $('~button-LOGIN');
  }

  get signUpButton() {
    return $('~button-SIGN UP');
  }

  get email() {
    return $('~input-email');
  }

  get password() {
    return $('~input-password');
  }

  get repeatPassword() {
    return $('~input-repeat-password');
  }

  async tapOnLoginContainerButton() {
    await this.loginContainerButton.click();
  }

  async tapOnSignUpContainerButton() {
    await this.signUpContainerButton.click();
  }

  async dismissKeyboardIfNeeded() {
    if (await driver.isKeyboardShown()) {
      await this.screen.click();
    }
  }

  async submitLoginForm({ username, password }) {
    await this.email.setValue(username);
    await this.password.setValue(password);
    await this.dismissKeyboardIfNeeded();
    await ensureElementVisible(this.loginButton, this.screen);
    await this.loginButton.click();
  }

  async submitSignUpForm({ username, password, repeatPassword }) {
    await this.email.setValue(username);
    await this.password.setValue(password);
    await this.repeatPassword.setValue(repeatPassword);
    await this.dismissKeyboardIfNeeded();
    await ensureElementVisible(this.signUpButton, this.screen);
    await this.signUpButton.click();
  }

  async tapLoginSubmitWithoutFilling() {
    await this.tapOnLoginContainerButton();
    await this.dismissKeyboardIfNeeded();
    await ensureElementVisible(this.loginButton, this.screen);
    await this.loginButton.click();
  }
}

module.exports = new LoginScreen();
