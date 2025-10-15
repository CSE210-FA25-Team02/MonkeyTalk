
import dotenv from 'dotenv';
dotenv.config();

/**
 * Application Constants
 * Contains configuration values and API keys
 */

// Google Gemini API Configuration
export const GEMINI_API_KEYS = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];

// API Configuration
export const API_CONFIG = {
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  GEMINI_MODEL: 'gemini-pro',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  TOP_P: 0.8,
  TOP_K: 10
};

// Application Settings
export const APP_CONFIG = {
  APP_NAME: 'MonkeyTalk',
  VERSION: '1.0.0',
  DESCRIPTION: 'Transform your words into emoji expressions and back again!'
};

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  NOTIFICATION_DURATION: 3000,
  MAX_HISTORY_ITEMS: 50
};
