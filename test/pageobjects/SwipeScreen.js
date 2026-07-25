const AppScreen = require('./AppScreen');
const { swipeUp, swipeLeft, swipeHorizontalInRect } = require('../helpers/mobileSwipe');
const { runNativeDemoInspectorSwipeSequence } = require('../helpers/nativeDemoInspectorSwipeSequence');

const SWIPE_SCREEN_SELECTOR = '~Swipe-screen';

/**
 * Emulador típico: 1080×1920, density 420.
 *
 * Android — `swipeCarouselToLastSlideAndroid`: por defeito usa a sequência `driver.action('pointer')`
 * calibrada no Appium Inspector ({@link ../helpers/nativeDemoInspectorSwipeSequence}).
 * ANDROID_USE_LEGACY_CAROUSEL_SWIPE=1 volta ao loop fling/swipe + swipeUp por slide.
 *
 * ANDROID_CAROUSEL_* , ANDROID_SWIPE_GESTURE_* , ANDROID_FLING_GESTURE_*
 * ANDROID_CAROUSEL_SKIP_VERTICAL_NUDGE=1 — só a parte horizontal+swipeUp em cada passo legacy
 */
function androidCarouselLayoutFromEnv() {
  return {
    topRatio: parseFloat(process.env.ANDROID_CAROUSEL_TOP_RATIO || '0.245'),
    heightRatio: parseFloat(process.env.ANDROID_CAROUSEL_HEIGHT_RATIO || '0.38'),
    leftRatio: parseFloat(process.env.ANDROID_CAROUSEL_LEFT_RATIO || '0.03'),
    widthRatio: parseFloat(process.env.ANDROID_CAROUSEL_WIDTH_RATIO || '0.94'),
    swipeSpeed: parseInt(process.env.ANDROID_SWIPE_GESTURE_SPEED || '2600', 10),
    swipePercent: parseFloat(process.env.ANDROID_SWIPE_GESTURE_PERCENT || '0.92'),
    flingSpeed: parseInt(process.env.ANDROID_FLING_GESTURE_SPEED || '14000', 10),
  };
}

function hasCustomCarouselRectEnv() {
  return (
    process.env.ANDROID_CAROUSEL_TOP_RATIO ||
    process.env.ANDROID_CAROUSEL_HEIGHT_RATIO ||
    process.env.ANDROID_CAROUSEL_LEFT_RATIO ||
    process.env.ANDROID_CAROUSEL_WIDTH_RATIO
  );
}

class SwipeScreen extends AppScreen {
  constructor() {
    super(SWIPE_SCREEN_SELECTOR);
  }

  get screen() {
    return $(SWIPE_SCREEN_SELECTOR);
  }

  get logo() {
    return $('~WebdriverIO logo');
  }

  /** Texto fixo no topo do ecrã — ajuda a sincronizar antes do carrossel (Reanimated). */
  get androidSwipeHeading() {
    return $('android=new UiSelector().textContains("Swipe horizontal")');
  }

  get androidFirstCarouselTitle() {
    return $('android=new UiSelector().textContains("FULLY OPEN")');
  }

  get androidLastCarouselTitle() {
    return $('android=new UiSelector().textContains("COMPATIBLE")');
  }

  get androidLastCarouselSubtitle() {
    return $('android=new UiSelector().textContains("TDD and BDD")');
  }

  androidCarouselSwipeArea() {
    const L = androidCarouselLayoutFromEnv();
    return driver.getWindowSize().then(({ width, height }) => {
      let left = Math.floor(width * L.leftRatio);
      let top = Math.floor(height * L.topRatio);
      let boxWidth = Math.floor(width * L.widthRatio);
      let boxHeight = Math.floor(height * L.heightRatio);

      if (width === 1080 && height === 1920 && !hasCustomCarouselRectEnv()) {
        left = 24;
        top = 640;
        boxWidth = 1032;
        boxHeight = 720;
      }

      return {
        width,
        height,
        left,
        top,
        boxWidth,
        boxHeight,
        swipeSpeed: L.swipeSpeed,
        swipePercent: L.swipePercent,
        flingSpeed: L.flingSpeed,
      };
    });
  }

  async androidSwipeCarouselHorizontal(area) {
    const { left, top, boxWidth, boxHeight, height: windowHeight, swipeSpeed, swipePercent, flingSpeed } =
      area;

    let moved = false;

    try {
      const flingOk = await browser.execute('mobile: flingGesture', {
        left,
        top,
        width: boxWidth,
        height: boxHeight,
        direction: 'left',
        speed: flingSpeed,
      });
      moved = flingOk === true;
    } catch {
      /* Appium 1.x na nuvem pode não suportar flingGesture */
    }

    if (!moved) {
      try {
        await browser.execute('mobile: swipeGesture', {
          left,
          top,
          width: boxWidth,
          height: boxHeight,
          direction: 'left',
          percent: swipePercent,
          speed: swipeSpeed,
        });
        moved = true;
      } catch {
        /* ignore */
      }
    }

    if (!moved) {
      try {
        await browser.execute('mobile: scrollGesture', {
          left,
          top,
          width: boxWidth,
          height: boxHeight,
          direction: 'left',
          percent: swipePercent,
          speed: swipeSpeed,
        });
        moved = true;
      } catch {
        /* ignore */
      }
    }

    if (!moved && process.env.BROWSERSTACK_USERNAME) {
      await swipeHorizontalInRect(driver, {
        left,
        top,
        width: boxWidth,
        height: boxHeight,
      });
      moved = true;
    }

    // W3C pointer actions podem bloquear no App Automate (Appium 1.x); evitar na nuvem.
    if (!moved && !process.env.BROWSERSTACK_USERNAME) {
      const yPct = (top + boxHeight / 2) / windowHeight;
      await swipeLeft(driver, {
        yPct: Math.min(0.92, Math.max(0.08, yPct)),
        moveDuration: 650,
      });
    }
  }

  /**
   * Carrossel no BrowserStack: `mobile: swipe` até o último slide ou limite de tentativas.
   */
  async swipeCarouselForCloudAndroid() {
    const maxSwipes = parseInt(process.env.BROWSERSTACK_CAROUSEL_SWIPES || '4', 10);

    for (let i = 0; i < maxSwipes; i++) {
      const area = await this.androidCarouselSwipeArea();
      await this.androidSwipeCarouselHorizontal(area);
      await browser.pause(500);
    }
  }

  /**
   * Avança um slide no carrossel (Android).
   * Horizontal (Appium → W3C swipeLeft) e swipeUp em ecrã completo.
   */
  async swipeCarouselNext() {
    const area = await this.androidCarouselSwipeArea();

    await this.androidSwipeCarouselHorizontal(area);

    if (process.env.ANDROID_CAROUSEL_SKIP_VERTICAL_NUDGE === '1') {
      return;
    }

    await swipeUp(driver);
  }

  async swipeCarouselToLastSlideAndroid() {
    const useLegacy = process.env.ANDROID_USE_LEGACY_CAROUSEL_SWIPE === '1';

    if (!useLegacy) {
      try {
        await runNativeDemoInspectorSwipeSequence(driver);
      } catch {
        for (let i = 0; i < 5; i++) {
          await this.swipeCarouselNext();
          await browser.pause(480);
        }
      }
    } else {
      for (let i = 0; i < 5; i++) {
        await this.swipeCarouselNext();
        await browser.pause(480);
      }
    }
    await browser.pause(400);
    const lastTitle = this.androidLastCarouselTitle;
    const lastSub = this.androidLastCarouselSubtitle;
    try {
      await lastTitle.waitForExist({ timeout: 20000 });
    } catch {
      await lastSub.waitForExist({ timeout: 20000 });
    }
  }
}

module.exports = new SwipeScreen();
