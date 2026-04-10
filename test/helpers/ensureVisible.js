/**
 * Garante que o elemento fique visível. No iOS evita scrollIntoView (ações W3C)
 * que em Xcode/iOS recentes podem falhar com waitForQuiescence.
 * No Android não use mobile: swipe (não suportado no UiAutomator2); usa scroll no
 * contentor ou gesto W3C.
 *
 * Fallback W3C: por defeito usa a sequência pointer do Appium Inspector
 * ({@link ./nativeDemoInspectorScrollUpSequence}).
 * ANDROID_USE_GENERIC_SCROLL_UP=1 — um único swipe percentual (72% → 28%).
 */

const { runNativeDemoInspectorScrollUpSequence } = require('./nativeDemoInspectorScrollUpSequence');

async function androidScrollStep(root) {
  if (root) {
    const el = await root;
    const elementId = el.elementId;
    if (elementId) {
      try {
        await browser.execute('mobile: scroll', {
          elementId,
          direction: 'down',
        });
        return true;
      } catch {
        try {
          await browser.execute('mobile:scroll', {
            elementId,
            direction: 'down',
          });
          return true;
        } catch {
          /* fall through */
        }
      }
    }
  }
  try {
    if (process.env.ANDROID_USE_GENERIC_SCROLL_UP === '1') {
      const { width, height } = await driver.getWindowSize();
      const x = Math.floor(width / 2);
      const y0 = Math.floor(height * 0.72);
      const y1 = Math.floor(height * 0.28);
      await driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x, y: y0 },
            { type: 'pointerDown', button: 0 },
            { type: 'pointerMove', duration: 350, x, y: y1 },
            { type: 'pointerUp', button: 0 },
          ],
        },
      ]);
      await driver.releaseActions();
    } else {
      await runNativeDemoInspectorScrollUpSequence(driver);
    }
    return true;
  } catch {
    return false;
  }
}

async function ensureElementVisible(element, scrollableElement, { maxSteps = 16 } = {}) {
  if (!driver.isIOS) {
    for (let i = 0; i < maxSteps; i++) {
      const el = await element;
      try {
        if ((await el.isExisting()) && (await el.isDisplayed())) {
          return;
        }
      } catch {
        /* continua */
      }
      const root = scrollableElement ? await scrollableElement : null;
      await androidScrollStep(root);
    }
    const el = await element;
    await el.waitForExist({ timeout: 15000 });
    await el.waitForDisplayed({ timeout: 10000 });
    return;
  }

  const el = await element;
  await el.waitForExist({ timeout: 20000 });
  const scrollRoot = scrollableElement ? await scrollableElement : null;

  for (let i = 0; i < maxSteps; i++) {
    try {
      if (await el.isDisplayed()) {
        return;
      }
    } catch {
      /* continua */
    }

    if (scrollRoot) {
      try {
        await browser.execute('mobile: scroll', {
          elementId: scrollRoot.elementId,
          direction: 'down',
        });
        continue;
      } catch {
        try {
          await browser.execute('mobile:scroll', {
            elementId: scrollRoot.elementId,
            direction: 'down',
          });
          continue;
        } catch {
          /* swipe global */
        }
      }
    }

    try {
      await browser.execute('mobile: swipe', { direction: 'up' });
    } catch {
      try {
        await browser.execute('mobile:swipe', { direction: 'up' });
      } catch {
        await browser.pause(250);
      }
    }
  }

  await el.waitForDisplayed({ timeout: 15000 });
}

module.exports = { ensureElementVisible };
