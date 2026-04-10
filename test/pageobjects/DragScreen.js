const AppScreen = require('./AppScreen');

class DragScreen extends AppScreen {
  constructor() {
    super('~Drag-drop-screen');
  }

  get retry() {
    return $('~button-Retry');
  }

  async waitForRetryButton() {
    await this.retry.waitForDisplayed();
  }
}

module.exports = new DragScreen();
