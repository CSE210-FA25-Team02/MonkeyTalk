/**
 * Core translation logic for Emoji Speak Translator
 * Handles text-to-emoji and emoji-to-text conversions
 */

// Emoji mapping for common emotions and concepts
const EMOJI_MAP = {
  // Emotions
  'happy': '😊',
  'joy': '😄',
  'excited': '🤩',
  'love': '❤️',
  'heart': '❤️',
  'sad': '😢',
  'crying': '😭',
  'angry': '😠',
  'mad': '😡',
  'surprised': '😲',
  'shocked': '😱',
  'confused': '😕',
  'worried': '😟',
  'thinking': '🤔',
  'sleepy': '😴',
  'tired': '😩',
  
  // Actions
  'laughing': '😂',
  'laugh': '😂',
  'smile': '😊',
  'wink': '😉',
  'kiss': '😘',
  'hug': '🤗',
  'clap': '👏',
  'thumbs up': '👍',
  'thumbs down': '👎',
  'wave': '👋',
  'dance': '💃',
  'party': '🎉',
  'celebrate': '🎊',
  
  // Objects
  'cake': '🎂',
  'gift': '🎁',
  'balloon': '🎈',
  'star': '⭐',
  'sun': '☀️',
  'moon': '🌙',
  'rainbow': '🌈',
  'fire': '🔥',
  'lightning': '⚡',
  'heart eyes': '😍',
  'money': '💰',
  'crown': '👑',
  
  // Weather
  'sunny': '☀️',
  'rainy': '🌧️',
  'snow': '❄️',
  'cloudy': '☁️',
  'storm': '⛈️',
  
  // Food
  'pizza': '🍕',
  'burger': '🍔',
  'coffee': '☕',
  'beer': '🍺',
  'wine': '🍷',
  'cake': '🎂',
  'ice cream': '🍦',
  
  // Animals
  'cat': '🐱',
  'dog': '🐶',
  'bird': '🐦',
  'fish': '🐠',
  'bear': '🐻',
  'lion': '🦁',
  'elephant': '🐘',
  'monkey': '🐵',
  
  // Activities
  'work': '💼',
  'study': '📚',
  'game': '🎮',
  'music': '🎵',
  'movie': '🎬',
  'book': '📖',
  'phone': '📱',
  'computer': '💻',
  'car': '🚗',
  'plane': '✈️',
  'train': '🚂',
  'bike': '🚲'
};

// Reverse mapping for emoji-to-text
const TEXT_MAP = Object.fromEntries(
  Object.entries(EMOJI_MAP).map(([text, emoji]) => [emoji, text])
);

/**
 * Translates text to emoji expressions
 * @param {string} text - Input text to translate
 * @returns {string} Emoji expression
 */
export function textToEmoji(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);

  const emojis = [];
  
  // Look for exact matches first
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check single word matches
    if (EMOJI_MAP[word]) {
      emojis.push(EMOJI_MAP[word]);
      continue;
    }
    
    // Check two-word phrases
    if (i < words.length - 1) {
      const phrase = `${word} ${words[i + 1]}`;
      if (EMOJI_MAP[phrase]) {
        emojis.push(EMOJI_MAP[phrase]);
        i++; // Skip next word
        continue;
      }
    }
    
    // Check for partial matches or similar words
    const similarEmoji = findSimilarEmoji(word);
    if (similarEmoji) {
      emojis.push(similarEmoji);
    }
  }
  
  // If no emojis found, return a default
  if (emojis.length === 0) {
    return getDefaultEmoji(text);
  }
  
  return emojis.join(' ');
}

/**
 * Translates emoji expressions to text
 * @param {string} emojiText - Input emoji text to translate
 * @returns {string} Natural language description
 */
export function emojiToText(emojiText) {
  if (!emojiText || typeof emojiText !== 'string') {
    return '';
  }

  // Split by spaces and filter out non-emoji characters
  const emojis = emojiText.split(/\s+/)
    .filter(char => {
      // Check if character is an emoji (basic check)
      return /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(char);
    });

  const descriptions = [];
  
  for (const emoji of emojis) {
    if (TEXT_MAP[emoji]) {
      descriptions.push(TEXT_MAP[emoji]);
    } else {
      descriptions.push(`[${emoji}]`);
    }
  }
  
  if (descriptions.length === 0) {
    return 'No recognizable emojis found';
  }
  
  return descriptions.join(', ');
}

/**
 * Finds similar emoji for a word using fuzzy matching
 * @param {string} word - Word to find emoji for
 * @returns {string|null} Similar emoji or null
 */
function findSimilarEmoji(word) {
  const wordLower = word.toLowerCase();
  
  // Check for partial matches
  for (const [text, emoji] of Object.entries(EMOJI_MAP)) {
    if (text.includes(wordLower) || wordLower.includes(text)) {
      return emoji;
    }
  }
  
  // Check for common variations
  const variations = {
    'smiling': '😊',
    'grinning': '😄',
    'loving': '❤️',
    'celebrating': '🎉',
    'eating': '🍕',
    'drinking': '☕',
    'playing': '🎮',
    'watching': '👀',
    'listening': '👂',
    'reading': '📖',
    'writing': '✍️',
    'running': '🏃',
    'walking': '🚶',
    'swimming': '🏊',
    'sleeping': '😴'
  };
  
  return variations[wordLower] || null;
}

/**
 * Returns a default emoji based on text sentiment
 * @param {string} text - Input text
 * @returns {string} Default emoji
 */
function getDefaultEmoji(text) {
  const positiveWords = ['good', 'great', 'awesome', 'amazing', 'wonderful', 'excellent', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'disappointed'];
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
  
  const textLower = text.toLowerCase();
  
  if (positiveWords.some(word => textLower.includes(word))) {
    return '😊';
  } else if (negativeWords.some(word => textLower.includes(word))) {
    return '😢';
  } else if (questionWords.some(word => textLower.includes(word)) || textLower.includes('?')) {
    return '🤔';
  } else {
    return '💭';
  }
}

/**
 * Validates if input contains emojis
 * @param {string} text - Text to validate
 * @returns {boolean} True if contains emojis
 */
export function containsEmojis(text) {
  if (!text) return false;
  
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(text);
}

/**
 * Gets translation statistics
 * @param {string} text - Input text
 * @param {string} mode - Translation mode
 * @returns {object} Statistics object
 */
export function getTranslationStats(text, mode) {
  if (!text) {
    return { wordCount: 0, emojiCount: 0, confidence: 0 };
  }
  
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const emojis = text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || [];
  
  let confidence = 0;
  if (mode === 'text-to-emoji') {
    // Calculate confidence based on how many words have emoji matches
    const matchedWords = words.filter(word => 
      EMOJI_MAP[word.toLowerCase()] || findSimilarEmoji(word.toLowerCase())
    );
    confidence = words.length > 0 ? (matchedWords.length / words.length) * 100 : 0;
  } else {
    // Calculate confidence based on recognized emojis
    confidence = emojis.length > 0 ? (emojis.filter(emoji => TEXT_MAP[emoji]).length / emojis.length) * 100 : 0;
  }
  
  return {
    wordCount: words.length,
    emojiCount: emojis.length,
    confidence: Math.round(confidence)
  };
}
