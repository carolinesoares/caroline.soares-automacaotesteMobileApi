const { expect } = require('chai');
const TabBar = require('../pageobjects/components/TabBar');
const LoginScreen = require('../pageobjects/LoginScreen');
const NativeAlert = require('../pageobjects/components/NativeAlert');
const loginData = require('../data/login-credentials.json');
const { waitForVisibleText } = require('../helpers/textAssertions');
const { ensureElementVisible } = require('../helpers/ensureVisible');

describe('Login e cadastro (native-demo-app)', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.openLogin();
    await browser.pause(600);
    await LoginScreen.waitForIsShown(true);
  });

  it('deve autenticar com credenciais lidas de JSON (data-driven)', async () => {
    const { email, password } = loginData[0];
    await LoginScreen.tapOnLoginContainerButton();
    await LoginScreen.submitLoginForm({ username: email, password });

    await NativeAlert.waitForIsShown(true);
    expect(await NativeAlert.text()).to.contain('Success');
    await NativeAlert.tapOnButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });

  it('deve exibir mensagem de erro para e-mail inválido', async () => {
    await LoginScreen.tapOnLoginContainerButton();
    await LoginScreen.email.setValue('email-invalido');
    await LoginScreen.password.setValue('Test1234!');
    await LoginScreen.dismissKeyboardIfNeeded();
    await ensureElementVisible(LoginScreen.loginButton, LoginScreen.screen);
    await LoginScreen.loginButton.click();

    await waitForVisibleText('valid email');
  });

  it('deve exibir mensagem de erro para senha curta', async () => {
    await LoginScreen.tapOnLoginContainerButton();
    await LoginScreen.email.setValue('ok@webdriver.io');
    await LoginScreen.password.setValue('curta');
    await LoginScreen.dismissKeyboardIfNeeded();
    await ensureElementVisible(LoginScreen.loginButton, LoginScreen.screen);
    await LoginScreen.loginButton.click();

    await waitForVisibleText('at least 8 characters');
  });

  it('deve exibir mensagem de erro quando confirmação de senha difere', async () => {
    await LoginScreen.tapOnSignUpContainerButton();
    await LoginScreen.email.setValue('cadastro@webdriver.io');
    await LoginScreen.password.setValue('Test1234!');
    await LoginScreen.repeatPassword.setValue('Test1234!X');
    await LoginScreen.dismissKeyboardIfNeeded();
    await ensureElementVisible(LoginScreen.signUpButton, LoginScreen.screen);
    await LoginScreen.signUpButton.click();

    await waitForVisibleText('same password');
  });

  it('deve concluir cadastro (sign up) com sucesso', async () => {
    await LoginScreen.tapOnSignUpContainerButton();
    await LoginScreen.submitSignUpForm({
      username: 'newuser@webdriver.io',
      password: 'Test1234!',
      repeatPassword: 'Test1234!',
    });

    await browser.pause(2000);
    await NativeAlert.waitForIsShown(true);
    expect(await NativeAlert.text()).to.contain('Signed Up');
    await NativeAlert.tapOnButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });
});
