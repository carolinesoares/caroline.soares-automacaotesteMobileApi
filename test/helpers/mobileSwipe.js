/**
 * Gestos W3C Pointer Actions — caminho recomendado com WebdriverIO + Appium 2.
 * Usa percentagens do ecrã (robusto entre resoluções); não usar touchAction (obsoleto).
 *
 * Parâmetros comuns opcionais: pauseMs (default 100), moveDuration (300–800, default 500).
 */

async function pointerSwipe(drv, opts) {
  const {
    startXPct,
    startYPct,
    endXPct,
    endYPct,
    pauseMs = 100,
    moveDuration = 500,
    pointerId = 'finger1',
  } = opts;

  const { width, height } = await drv.getWindowSize();
  const x0 = Math.floor(width * startXPct);
  const y0 = Math.floor(height * startYPct);
  const x1 = Math.floor(width * endXPct);
  const y1 = Math.floor(height * endYPct);

  await drv.performActions([
    {
      type: 'pointer',
      id: pointerId,
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x: x0, y: y0 },
        { type: 'pointerDown', button: 0 },
        { type: 'pause', duration: pauseMs },
        { type: 'pointerMove', duration: moveDuration, x: x1, y: y1 },
        { type: 'pointerUp', button: 0 },
      ],
    },
  ]);
  await drv.releaseActions();
}

/** Centro horizontal; baixo (80%) → cima (20%). */
async function swipeUp(drv, options = {}) {
  const x = options.xPct ?? 0.5;
  return pointerSwipe(drv, {
    startXPct: x,
    startYPct: options.startYPct ?? 0.8,
    endXPct: x,
    endYPct: options.endYPct ?? 0.2,
    pauseMs: options.pauseMs,
    moveDuration: options.moveDuration,
  });
}

/** Centro horizontal; cima (20%) → baixo (80%). */
async function swipeDown(drv, options = {}) {
  const x = options.xPct ?? 0.5;
  return pointerSwipe(drv, {
    startXPct: x,
    startYPct: options.startYPct ?? 0.2,
    endXPct: x,
    endYPct: options.endYPct ?? 0.8,
    pauseMs: options.pauseMs,
    moveDuration: options.moveDuration,
  });
}

/** Meio vertical; direita (80%) → esquerda (20%). */
async function swipeLeft(drv, options = {}) {
  const y = options.yPct ?? 0.5;
  return pointerSwipe(drv, {
    startXPct: options.startXPct ?? 0.8,
    startYPct: y,
    endXPct: options.endXPct ?? 0.2,
    endYPct: y,
    pauseMs: options.pauseMs,
    moveDuration: options.moveDuration,
  });
}

/** Meio vertical; esquerda (20%) → direita (80%). */
async function swipeRight(drv, options = {}) {
  const y = options.yPct ?? 0.5;
  return pointerSwipe(drv, {
    startXPct: options.startXPct ?? 0.2,
    startYPct: y,
    endXPct: options.endXPct ?? 0.8,
    endYPct: y,
    pauseMs: options.pauseMs,
    moveDuration: options.moveDuration,
  });
}

module.exports = {
  pointerSwipe,
  swipeUp,
  swipeDown,
  swipeLeft,
  swipeRight,
};
