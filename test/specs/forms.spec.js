const { expect } = require('chai');
const path = require('node:path');
const fs = require('node:fs');
const TabBar = require('../pageobjects/components/TabBar');
const FormsScreen = require('../pageobjects/FormsScreen');
const Picker = require('../pageobjects/components/Picker');
const NativeAlert = require('../pageobjects/components/NativeAlert');
const dropdownOptions = require('../data/dropdown-options.json');
const { ensureElementVisible } = require('../helpers/ensureVisible');

describe('Formulários e interações', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.openForms();
    await FormsScreen.waitForIsShown(true);
  });

  it('deve preencher o campo de texto e refletir no resultado', async () => {
    // Sem acentos: iOS/XCUITest costuma perder caracteres com setValue em texto longo.
    const text = 'Automacao mobile WebdriverIO';
    await FormsScreen.input.setValue(text);

    expect(await FormsScreen.inputTextResult.getText()).to.contain(text);

    if (await driver.isKeyboardShown()) {
      await FormsScreen.tapOnInputTextResult();
    }
  });

  it('deve alternar o switch entre OFF e ON', async () => {
    expect(await FormsScreen.isSwitchActive()).to.equal(false);
    await FormsScreen.tapOnSwitch();
    expect(await FormsScreen.isSwitchActive()).to.equal(true);
    await FormsScreen.tapOnSwitch();
    expect(await FormsScreen.isSwitchActive()).to.equal(false);
  });

  it('deve selecionar valores no dropdown usando dados de JSON (data-driven)', async () => {
    const dataPath = path.join(__dirname, '../data/dropdown-options.json');
    expect(fs.existsSync(dataPath)).to.be.true;

    for (const row of dropdownOptions) {
      await FormsScreen.tapOnDropDown();
      await Picker.selectValue(row.value);
      expect(await FormsScreen.getDropDownText()).to.contain(row.value);
    }
  });

  it('deve exibir alerta ao tocar no botão Active e fechar com OK', async () => {
    await ensureElementVisible(FormsScreen.activeButton, FormsScreen.screen);
    await FormsScreen.tapOnActiveButton();

    await NativeAlert.waitForIsShown(true);
    expect(await NativeAlert.text()).to.contain('This button is');
    await NativeAlert.tapOnButtonWithText('OK');
    await NativeAlert.waitForIsShown(false);
  });

});
