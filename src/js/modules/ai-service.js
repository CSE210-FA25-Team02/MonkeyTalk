/**
 * AI Service for Emoji Speak Translator
 * Handles API calls to external translation services
 */

// Configuration for different AI services
const AI_SERVICES = {
  openai: {
    name: 'OpenAI GPT',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    maxTokens: 150
  },
  huggingface: {
    name: 'Hugging Face',
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium'
  },
  // Fallback service using a free API
  freeapi: {
    name: 'Free Translation API',
    endpoint: 'https://api.mymemory.translated.net/get',
    fallback: true
  }
};

/**
 * AI Service class for handling translations
 */
export class AIService {
  constructor(serviceName = 'openai') {
    this.serviceName = serviceName;
    this.service = AI_SERVICES[serviceName];
    this.apiKey = this.getApiKey();
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Gets API key from environment or local storage
   * @returns {string|null} API key
   */
  getApiKey() {
    // In a real app, this would come from environment variables
    // For demo purposes, we'll use a placeholder
    return localStorage.getItem('ai_api_key') || null;
  }

  /**
   * Checks if the AI service is available
   * @returns {boolean} Service availability
   */
  checkAvailability() {
    return this.apiKey !== null || this.service.fallback;
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

    const prompt = `Convert the following text into emoji expressions. Use relevant emojis that represent the emotions, objects, and actions mentioned. Keep it concise and expressive.

Text: "${text}"

Emoji expression:`;

    try {
      const response = await this.callAI(prompt);
      return this.extractEmojiFromResponse(response);
    } catch (error) {
      console.error('AI translation error:', error);
      throw new Error('Failed to translate text to emoji');
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

    const prompt = `Convert the following emoji expression into natural language text. Describe what the emojis represent in a clear, readable way.

Emoji expression: "${emojiText}"

Natural language:`;

    try {
      const response = await this.callAI(prompt);
      return this.extractTextFromResponse(response);
    } catch (error) {
      console.error('AI translation error:', error);
      throw new Error('Failed to translate emoji to text');
    }
  }

  /**
   * Makes API call to the configured AI service
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callAI(prompt) {
    if (this.serviceName === 'openai') {
      return await this.callOpenAI(prompt);
    } else if (this.serviceName === 'huggingface') {
      return await this.callHuggingFace(prompt);
    } else {
      return await this.callFreeAPI(prompt);
    }
  }

  /**
   * Calls OpenAI API
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callOpenAI(prompt) {
    const response = await fetch(this.service.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.service.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.service.maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  /**
   * Calls Hugging Face API
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callHuggingFace(prompt) {
    const response = await fetch(this.service.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return data[0].generated_text || data[0].text || '';
  }

  /**
   * Calls free translation API as fallback
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callFreeAPI(prompt) {
    // This is a mock implementation for demo purposes
    // In a real app, you might use a different free service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple rule-based translation as fallback
        const fallbackResponse = this.getFallbackTranslation(prompt);
        resolve(fallbackResponse);
      }, 1000);
    });
  }

  /**
   * Provides fallback translation when AI is not available
   * @param {string} prompt - Input prompt
   * @returns {string} Fallback translation
   */
  getFallbackTranslation(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('emoji expression:')) {
      // Text to emoji fallback
      const text = prompt.split('Emoji expression:')[0].trim();
      return this.simpleTextToEmoji(text);
    } else if (lowerPrompt.includes('natural language:')) {
      // Emoji to text fallback
      const emojiText = prompt.split('Natural language:')[0].trim();
      return this.simpleEmojiToText(emojiText);
    }
    
    return 'Translation not available';
  }

  /**
   * Simple text to emoji fallback
   * @param {string} text - Input text
   * @returns {string} Emoji expression
   */
  simpleTextToEmoji(text) {
    const emojiMap = {
      'happy': '😊', 'joy': '😄', 'love': '❤️', 'sad': '😢',
      'angry': '😠', 'surprised': '😲', 'party': '🎉',
      'cake': '🎂', 'gift': '🎁', 'star': '⭐', 'sun': '☀️'
    };
    
    const words = text.toLowerCase().split(' ');
    const emojis = words.map(word => emojiMap[word] || '').filter(emoji => emoji);
    
    return emojis.length > 0 ? emojis.join(' ') : '😊';
  }

  /**
   * Simple emoji to text fallback
   * @param {string} emojiText - Input emoji text
   * @returns {string} Text description
   */
  simpleEmojiToText(emojiText) {
    const textMap = {
      '😊': 'happy', '😄': 'joyful', '❤️': 'love', '😢': 'sad',
      '😠': 'angry', '😲': 'surprised', '🎉': 'celebration',
      '🎂': 'cake', '🎁': 'gift', '⭐': 'star', '☀️': 'sun'
    };
    
    const emojis = emojiText.split(' ').filter(char => char.length > 0);
    const descriptions = emojis.map(emoji => textMap[emoji] || emoji).filter(desc => desc);
    
    return descriptions.length > 0 ? descriptions.join(', ') : 'emoji expression';
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
   * Sets API key for the service
   * @param {string} key - API key
   */
  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('ai_api_key', key);
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Gets service status
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      service: this.serviceName,
      available: this.isAvailable,
      hasApiKey: this.apiKey !== null,
      fallback: this.service.fallback
    };
  }
}

/**
 * Creates a new AI service instance
 * @param {string} serviceName - Name of the service to use
 * @returns {AIService} AI service instance
 */
export function createAIService(serviceName = 'openai') {
  return new AIService(serviceName);
}

/**
 * Gets available AI services
 * @returns {Array} List of available services
 */
export function getAvailableServices() {
  return Object.keys(AI_SERVICES).map(key => ({
    key,
    name: AI_SERVICES[key].name,
    fallback: AI_SERVICES[key].fallback || false
  }));
}
