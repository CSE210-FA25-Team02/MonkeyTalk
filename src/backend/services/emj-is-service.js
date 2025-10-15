
/**
 * Service for emj.is API
 * Handles text to emoji translation
 */
export class EmjIsService {
  constructor() {
    this.endpoint = 'https://www.emj.is/api/translate';
  }

  /**
   * Translates text to emoji using emj.is API
   * @param {string} text - Input text
   * @returns {Promise<string>} Emoji translation
   */
  async translateTextToEmoji(text) {
    return this.callWithRetry(async () => {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`emj.is API error: ${response.status}`);
      }

      const data = await response.json();
      return data.emojiText;
    });
  }

  /**
   * Calls a function with retry logic.
   * @param {Function} fn - The function to call.
   * @param {number} retries - The number of retries.
   * @param {number} delay - The delay between retries.
   * @returns {Promise<any>} The result of the function.
   */
  async callWithRetry(fn, retries = 2, delay = 1000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise(res => setTimeout(res, delay));
        }
      }
    }
    throw lastError;
  }
}
