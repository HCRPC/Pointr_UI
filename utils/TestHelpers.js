const fs = require('fs').promises;
const path = require('path');

/**
 * Test Helper Utilities
 * Common helper functions for tests
 */
class TestHelpers {
  /**
   * Create directory if it doesn't exist
   * @param {string} dirPath - Directory path
   */
  static async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Save content to file
   * @param {string} filePath - File path
   * @param {string} content - Content to save
   */
  static async saveToFile(filePath, content) {
    const dir = path.dirname(filePath);
    await this.ensureDirectory(dir);
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * Read file content
   * @param {string} filePath - File path
   * @returns {Promise<string>} File content
   */
  static async readFile(filePath) {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path
   * @returns {Promise<boolean>} True if file exists
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate timestamp string
   * @returns {string} Timestamp string
   */
  static getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   */

  /**
   * Retry an operation with exponential backoff
   * @param {Function} operation - Operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Operation result
   */

  /**
   * Log test step
   * @param {string} step - Step description
   * @param {string} status - Step status (PASS/FAIL/INFO)
   */
  static logStep(step, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${status}] ${step}`);
  }
}

module.exports = TestHelpers;

