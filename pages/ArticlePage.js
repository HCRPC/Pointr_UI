const BasePage = require('./BasePage');

/**
 * Article Page Object Model
 * Handles interactions with individual blog article pages
 */
class ArticlePage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page selectors
    this.selectors = {
      articleTitle: 'section[class=blog-post-main] h1',
      articleText: 'p',
      authorInfo: '[class*="author"]',
      publishDate: '[class*="date"]',
      // Content selectors for text extraction
      paragraphs: 'p',
      headings: 'h1, h2, h3, h4, h5, h6',
    };
  }

  /**
   * Navigate to a specific article
   * @param {string} articleUrl - The article URL
   */
  async navigateToArticle(articleUrl) {
    await this.goto(articleUrl);
    await this.waitForPageLoad();
  }

  /**
   * Verify article page has loaded correctly
   * @returns {Promise<boolean>} True if article page loaded successfully
   */
  async isArticlePageLoaded() {
    try {
      // Check for article title or content
      const titleExists = await this.isElementPresent(this.selectors.articleTitle);
      const hasText = await this.hasArticleText();
      
      return titleExists && hasText;
    } catch (error) {
      console.error('Error checking if article page loaded:', error);
      return false;
    }
  }

  /**
   * Check if article has text content
   * @returns {Promise<boolean>} True if article has text content
   */
  async hasArticleText() {
    const textElements = await this.page.$$(this.selectors.paragraphs);
    return textElements.length > 0;
  }

  /**
   * Get article title
   * @returns {Promise<string>} Article title
   */
  async getArticleTitle() {
    try {
      const element = await this.page.$(this.selectors.articleTitle);
      if (element) {
        const title = await element.textContent();
        if (title && title.trim().length > 0) {
          return title.trim();
        }
      }
      return 'Unknown Title';
    } catch (error) {
      console.error('Error getting article title:', error);
      return 'Unknown Title';
    }
  }

  /**
   * Get all text content from the article
   * @returns {Promise<string>} Complete article text
   */
  async getArticleText() {
    try {
      const textElements = await this.page.$$eval(
        'p, h1, h2, h3, h4, h5, h6, li',
        elements => elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
      );

      return this.cleanText(textElements.join(' '));
    } catch (error) {
      console.error('Error getting article text:', error);
      return '';
    }
  }

  /**
   * Clean and normalize text content
   * @param {string} text - Raw text content
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/[^\w\s]/g, ' ') // Replace non-word characters with space
      .toLowerCase() // Convert to lowercase
      .trim();
  }

  /**
   * Get author information
   * @returns {Promise<string>} Author name
   */
  async getAuthor() {
    try {
      const authorSelectors = [
        '.author',
        '[class*="author"]',
        'a:has-text("by ")'
      ];

      for (const selector of authorSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          const author = await element.textContent();
          if (author && author.trim().length > 0) {
            return author.trim().replace(/^by\s+/i, '');
          }
        }
      }

      return 'Unknown Author';
    } catch (error) {
      console.error('Error getting author:', error);
      return 'Unknown Author';
    }
  }

  /**
   * Get publish date
   * @returns {Promise<string>} Publish date
   */
  async getPublishDate() {
    try {
      const dateSelectors = [
        '.date',
        '[class*="date"]'
      ];

      for (const selector of dateSelectors) {
        const element = await this.page.$(selector);
        if (element) {
          const date = await element.textContent();
          if (date && date.trim().length > 0) {
            return date.trim();
          }
        }
      }

      return 'Unknown Date';
    } catch (error) {
      console.error('Error getting publish date:', error);
      return 'Unknown Date';
    }
  }

  /**
   * Scroll through the entire article to ensure all content is loaded
   */
  async scrollThroughArticle() {
    // Scroll to bottom to ensure all content is loaded
    await this.scrollToBottom();
    await this.page.waitForTimeout(1000);
    
    // Scroll back to top
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.page.waitForTimeout(500);
  }
}

module.exports = ArticlePage;
