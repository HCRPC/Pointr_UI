/**
 * Base Page Object Model class
 * Contains common functionality shared across all page objects
 */
class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - The URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Click on an element
   * @param {string} selector - Element selector
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Check if element exists
   * @param {string} selector - Element selector
   * @returns {Promise<boolean>} True if element exists
   */
  async isElementPresent(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom() {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
}

module.exports = BasePage;

