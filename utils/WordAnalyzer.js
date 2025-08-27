/**
 * Word Analyzer Utility
 * Handles word frequency analysis and text processing
 */
class WordAnalyzer {
  constructor() {
    // Common stop words to filter out
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'from', 'up', 'about', 'into', 'over',
      'after', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
      'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now',
      'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
      'if', 'because', 'as', 'until', 'while', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'among', 'through', 'during', 'before', 'after', 'above', 'below'
    ]);
  }

  /**
   * Clean and normalize text
   * @param {string} text - Raw text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  /**
   * Extract words from text
   * @param {string} text - Text to extract words from
   * @returns {Array} Array of words
   */
  extractWords(text) {
    const cleanedText = this.cleanText(text);
    if (!cleanedText) return [];

    return cleanedText
      .split(/\s+/)
      .filter(word => word.length >= 3) // Filter words shorter than 3 characters
      .filter(word => !this.stopWords.has(word)) // Filter stop words
      .filter(word => !/^\d+$/.test(word)) // Filter pure numbers
      .filter(word => word.trim().length > 0); // Filter empty strings
  }

  /**
   * Count word frequency
   * @param {Array} words - Array of words
   * @returns {Object} Word frequency object
   */
  countWordFrequency(words) {
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return frequency;
  }

  /**
   * Get top N words by frequency
   * @param {Object} frequency - Word frequency object
   * @param {number} count - Number of top words to return
   * @returns {Array} Array of {word, count} objects sorted by frequency
   */
  getTopWords(frequency, count = 5) {
    return Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }

  /**
   * Analyze text and return word frequency
   * @param {string} text - Text to analyze
   * @returns {Object} Analysis results
   */
  analyzeText(text) {
    const words = this.extractWords(text);
    const frequency = this.countWordFrequency(words);
    const topWords = this.getTopWords(frequency);
    
    return {
      totalWords: words.length,
      uniqueWords: Object.keys(frequency).length,
      frequency,
      topWords
    };
  }

  /**
   * Combine word frequencies from multiple texts
   * @param {Array} frequencyObjects - Array of frequency objects
   * @returns {Object} Combined frequency object
   */
  combineFrequencies(frequencyObjects) {
    const combined = {};
    
    frequencyObjects.forEach(freq => {
      Object.entries(freq).forEach(([word, count]) => {
        combined[word] = (combined[word] || 0) + count;
      });
    });

    return combined;
  }

  /**
   * Analyze multiple articles and return combined frequency and top words
   * @param {Array} articles - Array of article objects with text property
   * @param {number} topCount - Number of top words to return (default 5)
   * @returns {Object} Analysis result
   */
  analyzeMultipleArticles(articles, topCount = 5) {
    const articleAnalyses = [];
    const allFrequencies = [];

    for (const article of articles) {
      const analysis = this.analyzeText(article.text || '');
      article.analysis = analysis;
      articleAnalyses.push(article);
      allFrequencies.push(analysis.frequency);
    }

    const combinedFrequency = this.combineFrequencies(allFrequencies);
    const topWords = this.getTopWords(combinedFrequency, topCount);

    return {
      articles: articleAnalyses,
      combinedFrequency,
      topWords,
      totalArticles: articles.length
    };
  }

  /**
   * Save results to file format
   * @param {Array} topWords - Array of top words
   * @param analysis
   * @returns {string} File content
   */
  generateFileContent(topWords, analysis) {
    let content = 'Word Frequency Analysis Results\n';
    content += '===============================\n\n';
    content += `Analysis Date: ${new Date().toISOString()}\n`;
    content += `Articles Analyzed: ${analysis.articles.length}\n\n`;

    content += 'Articles:\n';
      analysis.articles.forEach((article, index) => {
      content += `${index + 1}. ${article.title || 'Unknown Title'}\n`;
      content += `   URL: ${article.url || 'Unknown URL'}\n`;
      content += `   Words: ${article.analysis?.totalWords || 0}\n\n`;
    });

    content += 'Top 5 Most Repeated Words Across All Articles:\n';
    content += '==============================================\n';
    
    topWords.forEach((item, index) => {
      content += `${index + 1}. "${item.word}" - ${item.count} occurrences\n`;
    });

    content += '\n\nGenerated by Haci Arpaci\n';
    
    return content;
  }
}

module.exports = WordAnalyzer;
