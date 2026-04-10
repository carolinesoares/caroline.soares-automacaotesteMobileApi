const { expect } = require('chai');
const TabBar = require('../pageobjects/components/TabBar');
const HomeScreen = require('../pageobjects/HomeScreen');
const LoginScreen = require('../pageobjects/LoginScreen');
const FormsScreen = require('../pageobjects/FormsScreen');
const SwipeScreen = require('../pageobjects/SwipeScreen');

describe('Navegação entre telas', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
  });

  it('deve percorrer Home, Login, Forms, Swipe e voltar à Home', async () => {
    await TabBar.openHome();
    await HomeScreen.waitForIsShown(true);

    await TabBar.openLogin();
    await LoginScreen.waitForIsShown(true);

    await TabBar.openForms();
    await FormsScreen.waitForIsShown(true);

    await TabBar.openSwipe();
    await SwipeScreen.waitForIsShown(true);

    if (driver.isIOS) {
      for (let i = 0; i < 10; i++) {
        if ((await SwipeScreen.logo.isExisting()) && (await SwipeScreen.logo.isDisplayed())) {
          break;
        }
        try {
          await driver.execute('mobile: swipe', { direction: 'left' });
        } catch {
          try {
            await driver.execute('mobile:swipe', { direction: 'left' });
          } catch {
            await browser.pause(200);
          }
        }
      }
      expect(await SwipeScreen.logo.isExisting()).to.equal(
        true,
        'elemento WebdriverIO logo deve existir no ecrã Swipe',
      );
    } else {
      await browser.waitUntil(
        async () =>
          (await SwipeScreen.androidSwipeHeading.isExisting()) ||
          (await SwipeScreen.androidFirstCarouselTitle.isExisting()),
        {
          timeout: 25000,
          timeoutMsg:
            'ecrã Swipe deve estar pronto (cabeçalho ou primeiro slide) antes do carrossel horizontal',
        },
      );
      await browser.pause(900);
      await SwipeScreen.swipeCarouselToLastSlideAndroid();
      const lastOk =
        (await SwipeScreen.androidLastCarouselTitle.isExisting()) ||
        (await SwipeScreen.androidLastCarouselSubtitle.isExisting());
      expect(lastOk).to.equal(
        true,
        'último slide do carrossel deve ficar visível após swipes horizontais (título ou subtítulo)',
      );
    }

    await TabBar.openHome();
    await HomeScreen.waitForIsShown(true);
  });
});
