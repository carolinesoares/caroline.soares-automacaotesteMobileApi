class AppScreen {
  /** @param {string} selector accessibility id (~id) */
  constructor(selector) {
    this.selector = selector;
  }

  async waitForIsShown(isShown = true) {
    await $(this.selector).waitForDisplayed({ reverse: !isShown });
  }
}

module.exports = AppScreen;
