/**
 * AI Service for Emoji Speak Translator
 * Handles API calls to external translation services
 */

import inContextLearningPrompt from './iclprompt.js';
import { GEMINI_API_KEYS, API_CONFIG } from '../constants.js';

// Configuration for Gemini service only
const AI_SERVICES = {
  gemini: {
    name: 'Google Gemini',
    endpoint: API_CONFIG.GEMINI_ENDPOINT,
    model: API_CONFIG.GEMINI_MODEL,
    maxTokens: API_CONFIG.MAX_TOKENS
  }
};

/**
 * AI Service class for handling translations
 */
export class AIService {
  constructor() {
    this.serviceName = 'gemini';
    this.service = AI_SERVICES.gemini;
    this.apiKeys = GEMINI_API_KEYS;
    this.currentApiKeyIndex = 0;
    this.isAvailable = this.apiKeys.length > 0 && this.apiKeys[0] !== 'YOUR_GEMINI_API_KEY_HERE';
  }

  /**
   * Gets the next API key in a round-robin fashion.
   * @returns {string} The next API key.
   */
  getNextApiKey() {
    const key = this.apiKeys[this.currentApiKeyIndex];
    this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
    return key;
  }

  /**
   * Translates text to emoji using AI
   * @param {string} text - Input text
   * @returns {Promise<string>} Emoji translation
   */
  async translateTextToEmoji(text) {
    if (!this.isAvailable) {
      throw new Error('AI service not available. Please configure API key.');
    }

    // Use the in-context learning prompt and replace the placeholder with user input
    const prompt = inContextLearningPrompt.replace('[USER_INPUT_HERE]', text);

    try {
      const response = await this.callAI(prompt);
      return this.extractEmojiFromResponse(response);
    } catch (error) {
      console.error('AI translation error:', error);
      throw new Error(`Failed to translate text to emoji: ${error.message}`);
    }
  }

  /**
   * Translates emoji to text using AI
   * @param {string} emojiText - Input emoji text
   * @returns {Promise<string>} Text translation
   */
  async translateEmojiToText(emojiText) {
    if (!this.isAvailable) {
      throw new Error('AI service not available. Please configure API key.');
    }

    // Use the in-context learning prompt and replace the placeholder with user input
    const prompt = inContextLearningPrompt.replace('[USER_INPUT_HERE]', emojiText);

    try {
      const response = await this.callAI(prompt);
      return this.extractTextFromResponse(response);
    } catch (error) {
      console.error('AI translation error:', error);
      throw new Error(`Failed to translate emoji to text: ${error.message}`);
    }
  }

  /**
   * Makes API call to Gemini
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callAI(prompt) {
    return await this.callWithRetry(() => this.callGemini(prompt));
  }

  /**
   * Calls a function with retry logic.
   * @param {Function} fn - The function to call.
   * @param {number} retries - The number of retries.
   * @param {number} delay - The delay between retries.
   * @returns {Promise<any>} The result of the function.
   */
  async callWithRetry(fn, retries = 2, delay = 1000) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 1) {
        await new Promise(res => setTimeout(res, delay));
        return this.callWithRetry(fn, retries - 1, delay);
      }
      throw error;
    }
  }


  /**
   * Calls Google Gemini API
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callGemini(prompt) {
    const apiKey = this.getNextApiKey();
    const endpoint = `${this.service.endpoint}?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: API_CONFIG.TEMPERATURE,
        maxOutputTokens: API_CONFIG.MAX_TOKENS,
        topP: API_CONFIG.TOP_P,
        topK: API_CONFIG.TOP_K
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No candidates in Gemini API response');
    }

    const candidate = data.candidates[0];

    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      throw new Error(`Response blocked by safety filters: ${candidate.finishReason}`);
    }

    if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
      return candidate.content.parts[0].text.trim();
    }

    throw new Error('No text content found in Gemini API response');
  }




  /**
   * Extracts emoji from AI response
   * @param {string} response - AI response
   * @returns {string} Extracted emojis
   */
  extractEmojiFromResponse(response) {
    // Extract emojis from the response
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = response.match(emojiRegex);
    
    if (emojis && emojis.length > 0) {
      return emojis.join(' ');
    }
    
    // If no emojis found, return the response as is
    return response;
  }

  /**
   * Extracts text from AI response
   * @param {string} response - AI response
   * @returns {string} Extracted text
   */
  extractTextFromResponse(response) {
    // Clean up the response
    return response
      .replace(/^["']|["']$/g, '') // Remove quotes
      .trim()
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Gets service status
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      service: 'gemini',
      available: this.isAvailable,
      hasApiKey: this.apiKeys.length > 0
    };
  }
}

/**
 * Creates a new AI service instance (Gemini only)
 * @returns {AIService} AI service instance
 */
export function createAIService() {
  return new AIService();
}

/**
 * Gets available AI services (Gemini only)
 * @returns {Array} List of available services
 */
export function getAvailableServices() {
  return [{
    key: 'gemini',
    name: 'Google Gemini',
    fallback: false
  }];
}
