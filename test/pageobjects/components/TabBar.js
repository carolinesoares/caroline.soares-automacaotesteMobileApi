class TabBar {
  static async openHome() {
    const tab = $('~Home');
    await tab.waitForDisplayed({ timeout: 15000 });
    await tab.click();
  }

  /** Após gestos no Swipe, o tab Home por vezes precisa de novo toque (BrowserStack / Reanimated). */
  static async openHomeAndWaitForScreen(screenAccessibilityId = '~Home-screen') {
    const tab = $('~Home');
    const screen = $(screenAccessibilityId);
    await tab.waitForDisplayed({ timeout: 15000 });

    for (let attempt = 0; attempt < 4; attempt++) {
      await tab.click();
      await browser.pause(700);
      try {
        if (await screen.isDisplayed()) {
          return;
        }
      } catch {
        /* ainda a transicionar */
      }
    }

    await screen.waitForDisplayed({ timeout: 20000 });
  }

  static async openWebView() {
    await $('~Webview').click();
  }

  static async openLogin() {
    await $('~Login').click();
  }

  static async openForms() {
    await $('~Forms').click();
  }

  static async openSwipe() {
    await $('~Swipe').click();
  }

  static async openDrag() {
    await $('~Drag').click();
  }

  static async waitForTabBarShown() {
    await $('~Home').waitForDisplayed({ timeout: 20000 });
  }
}

module.exports = TabBar;
