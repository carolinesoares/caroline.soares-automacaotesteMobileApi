/**
 * Três pointer swipes gravados no Appium Inspector (scroll para cima no native-demo-app).
 * Referência 1080×1920 — escala com getWindowSize().
 *
 * ANDROID_USE_GENERIC_SCROLL_UP=1 em ensureVisible ignora esta sequência no fallback Android.
 * ANDROID_INSPECTOR_SCROLL_UP_STEP_PAUSE_MS — pausa entre passos (default 280).
 */

const REFERENCE_WIDTH = 1080;
const REFERENCE_HEIGHT = 1920;

const INSPECTOR_SCROLL_UP_STEPS = [
  { x0: 472, y0: 963, x1: 475, y1: 213, duration: 1000 },
  { x0: 472, y0: 1520, x1: 469, y1: 921, duration: 1000 },
  { x0: 452, y0: 1478, x1: 459, y1: 387, duration: 1000 },
];

function scaleStep(step, width, height) {
  return {
    x0: Math.round((step.x0 * width) / REFERENCE_WIDTH),
    y0: Math.round((step.y0 * height) / REFERENCE_HEIGHT),
    x1: Math.round((step.x1 * width) / REFERENCE_WIDTH),
    y1: Math.round((step.y1 * height) / REFERENCE_HEIGHT),
    duration: step.duration,
  };
}

async function runNativeDemoInspectorScrollUpSequence(drv) {
  const { width, height } = await drv.getWindowSize();
  const pauseMs = parseInt(process.env.ANDROID_INSPECTOR_SCROLL_UP_STEP_PAUSE_MS || '280', 10);

  for (const raw of INSPECTOR_SCROLL_UP_STEPS) {
    const s = scaleStep(raw, width, height);
    await drv
      .action('pointer')
      .move({ duration: 0, x: s.x0, y: s.y0 })
      .down({ button: 0 })
      .move({ duration: s.duration, x: s.x1, y: s.y1 })
      .up({ button: 0 })
      .perform();

    if (pauseMs > 0) {
      await browser.pause(pauseMs);
    }
  }
}

module.exports = {
  runNativeDemoInspectorScrollUpSequence,
  INSPECTOR_SCROLL_UP_STEPS,
  REFERENCE_WIDTH,
  REFERENCE_HEIGHT,
};
