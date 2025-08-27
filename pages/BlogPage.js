const BasePage = require('./BasePage');

/**
 * Blog Page Object Model
 * Handles interactions with the Pointr blog page
 */
class BlogPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Page selectors
    this.selectors = {
      blogTitle: 'h1:has-text("Explore the Pointr Blog")',
      articleCards: 'section[class=blog-posts] div[class^="single_article d-flex"]',
      articleTitles: '.single-article--title',
      articleLinks: '.single-article--title > span > a[href*="/blog/"]',
      featuredSection: 'section:has-text("Featured")',
      latestSection: 'section:has-text("Latest")',
      articleContainers: 'section[class=blog-posts]',
      readMoreLinks: 'a:has-text("Read more")',
      authorLinks: 'a:has-text("by ")',
    };
  }

  /**
   * Navigate to the blog page
   */
  async navigateToBlog() {
    await this.goto('/blog');
    await this.waitForPageLoad();
  }

  /**
   * Verify blog page has loaded correctly
   * @returns {Promise<boolean>} True if blog page loaded successfully
   */
  async isBlogPageLoaded() {
    try {
      // Check for blog title or any blog-specific content
      const titleExists = await this.isElementPresent(this.selectors.blogTitle);
      const hasArticles = await this.hasArticles();
      
      return titleExists && hasArticles;
    } catch (error) {
      console.error('Error checking if blog page loaded:', error);
      return false;
    }
  }

  /**
   * Check if articles are present on the page
   * @returns {Promise<boolean>} True if articles are found
   */
  async hasArticles() {
    // Try multiple selectors to find articles
    const selectors = [
      this.selectors.articleCards,
      this.selectors.articleLinks,
      this.selectors.articleContainers,
      this.selectors.readMoreLinks
    ];

    for (const selector of selectors) {
      const elements = await this.page.$$(selector);
      if (elements.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get article links from the page
   * @returns {Promise<Array>} Array of article URLs
   */
  async getArticleLinks() {
    // Wait for page to load
    await this.waitForPageLoad();
    
    // Get all links that point to blog articles
    const links = await this.page.$$eval('.single-article--title > span > a[href*="/blog/"]', elements =>
      elements
        .map(el => el.href)
        .filter((href, index, array) => array.indexOf(href) === index) // Remove duplicates
    );

    return links;
  }

  /**
   * Get the latest N article links
   * @param {number} count - Number of articles to get
   * @returns {Promise<Array>} Array of latest article URLs
   */
  async getLatestArticleLinks(count = 3) {
    const allLinks = await this.getArticleLinks();
    return allLinks.slice(0, count);
  }

  /**
   * Get article count on the page
   * @returns {Promise<number>} Number of articles found
   */
  async getArticleCount() {
    const links = await this.getArticleLinks();
    return links.length;
  }

  /**
   * Verify all articles have loaded by checking for minimum expected count
   * @param {number} minCount - Minimum expected article count
   * @returns {Promise<boolean>} True if minimum articles are loaded
   */
  async verifyArticlesLoaded(minCount = 3) {
    const count = await this.getArticleCount();
    return count >= minCount;
  }
}

module.exports = BlogPage;
