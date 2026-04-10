/**
 * Sequência de pointer actions gravada no Appium Inspector no native-demo-app
 * (ecrã Swipe: carrossel + scroll). Referência de resolução 1080×1920 — escala para o
 * `getWindowSize()` actual.
 *
 * WebdriverIO 9: `driver.action('pointer')` (API de cadeia).
 *
 * ANDROID_USE_LEGACY_CAROUSEL_SWIPE=1 em SwipeScreen ignora esta sequência.
 * ANDROID_INSPECTOR_SWIPE_STEP_PAUSE_MS — pausa entre passos (default 280).
 */

const REFERENCE_WIDTH = 1080;
const REFERENCE_HEIGHT = 1920;

/** Ordem e coordenadas exactas do Inspector. */
const INSPECTOR_POINTER_STEPS = [
  { x0: 1022, y0: 1337, x1: 95, y1: 1334, duration: 1000 },
  { x0: 1032, y0: 1334, x1: 46, y1: 1340, duration: 1000 },
  { x0: 1019, y0: 1337, x1: 95, y1: 1353, duration: 1000 },
  { x0: 1042, y0: 1379, x1: 111, y1: 1366, duration: 1000 },
  { x0: 632, y0: 1386, x1: 639, y1: 482, duration: 1000 },
  { x0: 718, y0: 380, x1: 718, y1: 1353, duration: 1000 },
  { x0: 934, y0: 1533, x1: 924, y1: 278, duration: 1000 },
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

async function runNativeDemoInspectorSwipeSequence(drv) {
  const { width, height } = await drv.getWindowSize();
  const pauseMs = parseInt(process.env.ANDROID_INSPECTOR_SWIPE_STEP_PAUSE_MS || '280', 10);

  for (const raw of INSPECTOR_POINTER_STEPS) {
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

  try {
    await drv.releaseActions();
  } catch {
    /* sessão sem acções pendentes */
  }
}

module.exports = {
  runNativeDemoInspectorSwipeSequence,
  INSPECTOR_POINTER_STEPS,
  REFERENCE_WIDTH,
  REFERENCE_HEIGHT,
};
