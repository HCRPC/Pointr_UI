const { test, expect } = require('@playwright/test');
const BlogPage = require('../pages/BlogPage');
const ArticlePage = require('../pages/ArticlePage');
const WordAnalyzer = require('../utils/WordAnalyzer');
const TestHelpers = require('../utils/TestHelpers');
const path = require('path');

test.describe('Pointr Blog Tests', () => {
  let blogPage;
  let articlePage;
  let wordAnalyzer;

  test.beforeEach(async ({ page }) => {
    blogPage = new BlogPage(page);
    articlePage = new ArticlePage(page);
    wordAnalyzer = new WordAnalyzer();

  });

  test('Verify blog page loads and articles are present', async ({ page, browserName }) => {
    TestHelpers.logStep('Starting blog page validation test', 'INFO');
    
    try {
      // Navigate to blog page
      TestHelpers.logStep('Navigating to blog page', 'INFO');
      await blogPage.navigateToBlog();
      
      // Take screenshot for verification
      await blogPage.takeScreenshot(`blog-page-${browserName}`);
      
      // Verify blog page loaded, check title and articles
      TestHelpers.logStep('Verifying blog page loaded', 'INFO');
      const isLoaded = await blogPage.isBlogPageLoaded();
      expect(isLoaded).toBe(true);
      TestHelpers.logStep('Blog page loaded successfully', 'PASS');

      //Get article count
      const articleCount = await blogPage.getArticleCount();
      TestHelpers.logStep(`Found ${articleCount} articles on blog page`, 'INFO');
      expect(articleCount).toBeGreaterThan(0);
      
      //Verify minimum expected articles
      const minArticles = 3;
      const hasMinimumArticles = await blogPage.verifyArticlesLoaded(minArticles);
      expect(hasMinimumArticles).toBe(true);
      TestHelpers.logStep(`Verified at least ${minArticles} articles are loaded`, 'PASS');
      
    } catch (error) {
      TestHelpers.logStep(`Blog validation failed: ${error.message}`, 'FAIL');
      throw error;
    }
  });

  test('Extract and analyze word frequency from latest 3 articles', async ({ page, browserName }) => {
    TestHelpers.logStep('Starting word frequency analysis test', 'INFO');
    
    try {
      // Navigate to blog page
      TestHelpers.logStep('Navigating to blog page', 'INFO');
      await blogPage.navigateToBlog();
      
      // Get latest article links
      TestHelpers.logStep('Getting latest article links', 'INFO');
      const articleLinks = await blogPage.getLatestArticleLinks(3);
      expect(articleLinks.length).toBeGreaterThanOrEqual(3);
      TestHelpers.logStep(`Found ${articleLinks.length} article links`, 'INFO');
      
      const articles = [];
      
      // Process each article
      for (let i = 0; i < Math.min(articleLinks.length, 3); i++) {
        const articleUrl = articleLinks[i];
        TestHelpers.logStep(`Processing article ${i + 1}: ${articleUrl}`, 'INFO');
        
        try {
          // Navigate to article
          await articlePage.navigateToArticle(articleUrl);
          
          // Verify article loaded
          const isLoaded = await articlePage.isArticlePageLoaded();
          expect(isLoaded).toBe(true);
          
          // Scroll through article to ensure all content is loaded
          await articlePage.scrollThroughArticle();
          
          // Extract article data
          const title = await articlePage.getArticleTitle();
          const text = await articlePage.getArticleText();
          const author = await articlePage.getAuthor();
          const date = await articlePage.getPublishDate();
          
          TestHelpers.logStep(`Extracted article: "${title}" by ${author}`, 'INFO');
          TestHelpers.logStep(`Article text length: ${text.length} characters`, 'INFO');
          
          // Verify we have substantial content
          expect(text.length).toBeGreaterThan(100);
          
          articles.push({
            title,
            url: articleUrl,
            text,
            author,
            date,
            index: i + 1
          });
          
          // Take screenshot of article
          await articlePage.takeScreenshot(`article-${i + 1}-${browserName}`);
          
        } catch (error) {
          TestHelpers.logStep(`Error processing article ${i + 1}: ${error.message}`, 'FAIL');
          // Continue with other articles even if one fails
          articles.push({
            title: `Article ${i + 1} (Error)`,
            url: articleUrl,
            text: '',
            author: 'Unknown',
            date: 'Unknown',
            index: i + 1,
            error: error.message
          });
        }
      }
      
      // Analyze word frequency across all articles.
      TestHelpers.logStep('Analyzing word frequency across all articles', 'INFO');
      const analysis = wordAnalyzer.analyzeMultipleArticles(articles, 5);
      
      // Verify we have results
      expect(analysis.topWords.length).toBeGreaterThan(0);
      expect(analysis.topWords.length).toBeLessThanOrEqual(5);
      
      // Log results
      TestHelpers.logStep('Word frequency analysis completed', 'PASS');
      analysis.topWords.forEach((item, index) => {
        TestHelpers.logStep(`${index + 1}. "${item.word}": ${item.count} occurrences`, 'INFO');
      });
      
      // Generate results file content
      const resultsContent = wordAnalyzer.generateFileContent(analysis.topWords, analysis);
      
      // Save results to file
      const timestamp = TestHelpers.getTimestamp();
      const resultsFilename = `word-frequency-results-${browserName}-${timestamp}.txt`;
      const resultsPath = path.join('./test-results', resultsFilename);
      
      await TestHelpers.saveToFile(resultsPath, resultsContent);
      TestHelpers.logStep(`Results saved to: ${resultsPath}`, 'PASS');

      // Verify the results file was created
      const fileExists = await TestHelpers.fileExists(resultsPath);
      expect(fileExists).toBe(true);
      
      TestHelpers.logStep('Word frequency analysis test completed successfully', 'PASS');
      
    } catch (error) {
      TestHelpers.logStep(`Word frequency analysis failed: ${error.message}`, 'FAIL');
      throw error;
    }
  });

});

