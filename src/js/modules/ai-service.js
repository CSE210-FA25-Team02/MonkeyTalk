/**
 * AI Service for Emoji Speak Translator
 * Handles API calls to external translation services
 */

import inContextLearningPrompt, { buildTeasingAnalysisPrompt } from './iclprompt.js';
import { GEMINI_API_KEY, API_CONFIG } from '../constants.js';

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
    this.apiKey = this.getApiKey();
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Gets API key from constants file
   * @returns {string|null} API key
   */
  getApiKey() {
    // Check if API key is set in constants
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
      return GEMINI_API_KEY;
    }
    
    // Fallback to localStorage for development
    return localStorage.getItem('gemini_api_key') || null;
  }

  /**
   * Checks if the Gemini service is available
   * @returns {boolean} Service availability
   */
  checkAvailability() {
    return this.apiKey !== null;
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
    return await this.callGemini(prompt);
  }


  /**
   * Calls Google Gemini API
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>} AI response
   */
  async callGemini(prompt) {
    console.log('Calling Gemini API with prompt:', prompt);
    console.log('API Key (first 10 chars):', this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'No API key');
    console.log('Endpoint:', this.service.endpoint);
    
    // Validate API key exists
    if (!this.apiKey) {
      throw new Error('No Gemini API key provided');
    }
    
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

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${this.service.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        errorMessage += ` - ${errorData.error?.message || errorData.message || 'Unknown error'}`;
      } catch (e) {
        const errorText = await response.text();
        console.error('Error text:', errorText);
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Response data:', data);
    
    // Check for different possible response structures
    if (!data.candidates || !data.candidates[0]) {
      console.error('No candidates found in response:', data);
      throw new Error('No candidates in Gemini API response');
    }

    const candidate = data.candidates[0];
    console.log('First candidate:', candidate);
    
    // Check if the response was blocked or filtered
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      throw new Error(`Response blocked by safety filters: ${candidate.finishReason}`);
    }
    
    // Check for content in different possible structures
    let result = null;
    
    // Handle the actual Gemini response structure
    if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
      result = candidate.content.parts[0].text;
    } else if (candidate.content && candidate.content.role === 'model') {
      // This is the structure we're seeing: {"content":{"role":"model"},"finishReason":"MAX_TOKENS"}
      // The content might be in a different field or the response was truncated
      console.log('Found model role content, checking for text in other fields...');
      
      // Check if there's text in the candidate itself
      if (candidate.text) {
        result = candidate.text;
      } else if (candidate.output) {
        result = candidate.output;
      } else {
        // If finishReason is MAX_TOKENS, the response was cut off
        if (candidate.finishReason === 'MAX_TOKENS') {
          throw new Error('Response was truncated due to token limit. Try reducing the prompt length or increasing maxOutputTokens.');
        }
        throw new Error(`Content found but no text extracted. Candidate: ${JSON.stringify(candidate)}`);
      }
    } else if (candidate.text) {
      result = candidate.text;
    } else if (candidate.output) {
      result = candidate.output;
    } else {
      console.error('Unexpected response structure:', candidate);
      throw new Error(`Invalid response format from Gemini API. Candidate structure: ${JSON.stringify(candidate)}`);
    }

    if (!result) {
      throw new Error('No text content found in Gemini API response');
    }

    const trimmedResult = result.trim();
    console.log('Extracted result:', trimmedResult);
    return trimmedResult;
  }

  /**
   * Gets lightweight teasing analysis for input to drive teasing UX
   * Returns a small JSON object with fields used by the UI.
   * Never throws; on errors it returns a safe fallback object.
   * @param {string} input - user input
   * @param {string} mode - 'text-to-emoji' | 'emoji-to-text'
   * @returns {Promise<{valid:boolean, category:string, tone:string, shortTease:string, reason?:string}>}
   */
  async getTeasingAnalysis(input, mode) {
    if (!this.isAvailable) {
      return { valid: true, category: 'general', tone: 'neutral', shortTease: this.defaultTeaseForMode(mode) };
    }

    const analysisPrompt = buildTeasingAnalysisPrompt(input, mode);

    try {
      const raw = await this.callAI(analysisPrompt);
      // Try to parse JSON from the model response; fall back on defaults
      const jsonStart = raw.indexOf('{');
      const jsonEnd = raw.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
        // Basic normalization
        return {
          valid: typeof parsed.valid === 'boolean' ? parsed.valid : true,
          category: parsed.category || 'general',
          tone: parsed.tone || 'neutral',
          shortTease: parsed.shortTease || this.defaultTeaseForMode(mode),
          reason: parsed.reason
        };
      }
    } catch (e) {
      // Swallow errors, UI will use defaults
    }
    return { valid: true, category: 'general', tone: 'neutral', shortTease: this.defaultTeaseForMode(mode) };
  }

  /**
   * Default tease used when analysis isn't available
   */
  defaultTeaseForMode(mode) {
    if (mode === 'emoji-to-text') return '🐒 Charging monkey energy to read emojis...';
    return '🐒 Charging monkey energy to craft emojis...';
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
    localStorage.setItem('gemini_api_key', key);
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Gets service status
   * @returns {object} Service status information
   */
  getStatus() {
    return {
      service: 'gemini',
      available: this.isAvailable,
      hasApiKey: this.apiKey !== null
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
