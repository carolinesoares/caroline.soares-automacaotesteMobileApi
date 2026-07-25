const { expect } = require('chai');
const TabBar = require('../pageobjects/components/TabBar');
const HomeScreen = require('../pageobjects/HomeScreen');
const LoginScreen = require('../pageobjects/LoginScreen');
const FormsScreen = require('../pageobjects/FormsScreen');
const SwipeScreen = require('../pageobjects/SwipeScreen');

async function relaunchAppOnBrowserStack() {
  const pkg = process.env.ANDROID_APP_PACKAGE || 'com.wdiodemoapp';
  const activity = process.env.ANDROID_APP_ACTIVITY || 'com.wdiodemoapp.MainActivity';

  try {
    await driver.startActivity(pkg, activity);
  } catch {
    try {
      await driver.execute('mobile: startActivity', { appPackage: pkg, appActivity: activity });
    } catch {
      /* ignore */
    }
  }

  await browser.pause(2000);
  await TabBar.waitForTabBarShown();
}

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
      const onFirstSlideBefore = await SwipeScreen.androidFirstCarouselTitle.isExisting();

      if (process.env.BROWSERSTACK_USERNAME) {
        await SwipeScreen.swipeCarouselForCloudAndroid();
      } else {
        await SwipeScreen.swipeCarouselToLastSlideAndroid();
      }

      const lastOk =
        (await SwipeScreen.androidLastCarouselTitle.isExisting()) ||
        (await SwipeScreen.androidLastCarouselSubtitle.isExisting());
      const carouselMoved =
        onFirstSlideBefore && !(await SwipeScreen.androidFirstCarouselTitle.isExisting());

      expect(lastOk || carouselMoved).to.equal(
        true,
        'carrossel Swipe deve avançar (último slide ou saída do primeiro slide) após gestos horizontais',
      );

      if (process.env.BROWSERSTACK_USERNAME) {
        await relaunchAppOnBrowserStack();
      }
    }

    await TabBar.openHomeAndWaitForScreen('~Home-screen');
    await HomeScreen.waitForIsShown(true);
  });
});
