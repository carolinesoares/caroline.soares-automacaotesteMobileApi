/**
 * Aguarda texto visível (helper-login: erros inline do Input).
 * @param {string} partialText trecho único da mensagem esperada
 */
async function waitForVisibleText(partialText) {
  if (driver.isAndroid) {
    await $(`//*[contains(@text, "${partialText}")]`).waitForDisplayed({
      timeout: 8000,
    });
    return;
  }

  const lit = partialText.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  await $(
    `-ios predicate string:type == 'XCUIElementTypeStaticText' AND (label CONTAINS[c] '${lit}' OR value CONTAINS[c] '${lit}')`,
  ).waitForDisplayed({
    timeout: 8000,
  });
}

module.exports = { waitForVisibleText };
