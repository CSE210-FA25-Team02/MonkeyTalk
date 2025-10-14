/**
 * UI Controller for Emoji Speak Translator
 * Handles DOM manipulation and user interactions
 */

import { createAIService } from './ai-service.js';
import { buttonSound, monkeySound } from './sounds.js';
import { startMoneyRain } from './dollar-rain.js';


export class UIController {
  constructor() {
    this.aiService = createAIService();
    this.translationHistory = this.loadHistory();
    this.isTranslating = false;
    
    this.initializeElements();
    this.bindEvents();
    this.updateUI();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.elements = {
      modeRadios: document.querySelectorAll('input[name="mode"]'),
      inputText: document.getElementById('input-text'),
      outputText: document.getElementById('output-text'),
      translateButton: document.getElementById('translate-button'),
      copyButton: document.getElementById('copy-button'),
      historyList: document.getElementById('history-list'),
      clearHistoryButton: document.getElementById('clear-history'),
      helpSection: document.querySelector('.help-section')
    };
    // Monkey loader
    this.elements.monkeyLoader = document.createElement('main');
    this.elements.monkeyLoader.className = 'monkey-loader';
    this.elements.monkeyLoader.innerHTML = `
      <img src="./assets/monkey.gif" alt="Monkey loading" />
      <p>Translating...</p>
    `;
    Object.assign(this.elements.monkeyLoader.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      display: 'none',
      zIndex: '1000'
    });
    document.body.appendChild(this.elements.monkeyLoader);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Mode change events
    this.elements.modeRadios.forEach(radio => {
      radio.addEventListener('change', () => this.handleModeChange());
    });

    // Translate button event
    this.elements.translateButton.addEventListener('click', () => {
      this.handleTranslateClick();
    });

    // Copy button event
    this.elements.copyButton.addEventListener('click', () => {
      this.handleCopyClick();
    });

    // Clear history event
    this.elements.clearHistoryButton.addEventListener('click', () => {
      this.handleClearHistory();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  /**
   * Handles mode change between text-to-emoji and emoji-to-text
   */
  handleModeChange() {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(err => console.error(err));
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    
    // Update placeholder text
    if (selectedMode === 'text-to-emoji') {
      this.elements.inputText.placeholder = 'Type your message here...';
      this.elements.outputText.placeholder = 'Your emoji translation will appear here';
    } else {
      this.elements.inputText.placeholder = 'Enter emoji expressions...';
      this.elements.outputText.placeholder = 'Your text translation will appear here';
    }

    // Clear current translation
    this.elements.outputText.value = '';
  }

  /**
   * Handles translate button click
   */
  handleTranslateClick() {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(err => console.error(err));
    const text = this.elements.inputText.value.trim();
    if (!text) {
      this.showNotification('Please enter some text to translate', 'error');
      return;
    }
    this.translateText(text);
  }

  /**
   * Translates text using AI service or fallback
   * @param {string} text - Text to translate
   */
  async translateText(text) {
    if (!text.trim()) {
      this.elements.outputText.value = '';
      return;
    }

    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    
    try {
      this.setLoadingState(true);
      
      let translation;
      
      if (this.aiService.getStatus().available) {
        // Use Gemini service
        if (selectedMode === 'text-to-emoji') {
          translation = await this.aiService.translateTextToEmoji(text);
        } else {
          translation = await this.aiService.translateEmojiToText(text);
        }
      } else {
        throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in constants.js file.');
      }

      this.elements.outputText.value = translation;

      // Hide monkey loader
      this.setLoadingState(false);

      // Trigger falling money effect (optimized for FPS)
      startMoneyRain({
        numBills: 150,
        duration: 8000,
        imageSize: 50,
        imageUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b8.png'
      });
      
      // Add to history
      this.addToHistory(text, translation, selectedMode);

      
    } catch (error) {
      console.error('Translation error:', error);
      this.elements.outputText.value = 'Translation failed. Please check your API key configuration.';
    } finally {
      monkeySound.currentTime = 0;
      monkeySound.play();
      this.setLoadingState(false);
    }
  }

  /**
   * Handles copy button click
   */
  async handleCopyClick() {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(err => console.error(err));
    const text = this.elements.outputText.value;
    
    if (!text) {
      this.showNotification('Nothing to copy', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showNotification('Copied to clipboard!', 'success');
      
      // Visual feedback
      this.elements.copyButton.textContent = '✅ Copied';
      setTimeout(() => {
        this.elements.copyButton.textContent = '📋 Copy';
      }, 2000);
      
    } catch (error) {
      console.error('Copy failed:', error);
      this.showNotification('Failed to copy', 'error');
    }
  }

  /**
   * Handles clear history button click
   */
  handleClearHistory() {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(err => console.error(err));
    if (confirm('Are you sure you want to clear all translation history?')) {
      this.translationHistory = [];
      this.saveHistory();
      this.updateHistoryDisplay();
      this.showNotification('History cleared', 'success');
    }
  }

  /**
   * Handles keyboard shortcuts
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to translate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.handleTranslateClick();
    }
    
    // Ctrl/Cmd + C to copy (when output is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === this.elements.outputText) {
      this.handleCopyClick();
    }
    
    // Escape to clear input
    if (e.key === 'Escape') {
      this.elements.inputText.value = '';
      this.elements.outputText.value = '';
      this.elements.inputText.focus();
    }
  }

  /**
   * Sets loading state for UI elements
   * @param {boolean} isLoading - Loading state
   */
  setLoadingState(isLoading) {
    this.isTranslating = isLoading;

    if (isLoading) {
      this.elements.translateButton.disabled = true;
      this.elements.translateButton.textContent = '⏳ Translating...';
      this.elements.outputText.classList.add('loading');
      this.elements.outputText.value = 'Translating...';

      // Show monkey loader
      this.elements.monkeyLoader.style.display = 'block';
    } else {
      this.elements.translateButton.disabled = false;
      this.elements.translateButton.textContent = '🔄 Translate';
      this.elements.outputText.classList.remove('loading');

      // Hide monkey loader
      this.elements.monkeyLoader.style.display = 'none';
    }
  }


  /**
   * Shows notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('aside');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '1000',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Adds translation to history
   * @param {string} input - Input text
   * @param {string} output - Output text
   * @param {string} mode - Translation mode
   */
  addToHistory(input, output, mode) {
    const historyItem = {
      id: Date.now(),
      input,
      output,
      mode,
      timestamp: new Date().toISOString()
    };
    
    this.translationHistory.unshift(historyItem);
    
    // Keep only last 50 items
    if (this.translationHistory.length > 50) {
      this.translationHistory = this.translationHistory.slice(0, 50);
    }
    
    this.saveHistory();
    this.updateHistoryDisplay();
  }

  /**
   * Updates history display
   */
  updateHistoryDisplay() {
    this.elements.historyList.innerHTML = '';
    
    if (this.translationHistory.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'history-item';
      emptyItem.innerHTML = '<p>No translations yet. Start typing to see your history!</p>';
      this.elements.historyList.appendChild(emptyItem);
      return;
    }
    
    this.translationHistory.forEach(item => {
      const historyItem = document.createElement('li');
      historyItem.className = 'history-item';
      historyItem.innerHTML = `
        <article class="history-content">
          <section class="history-text">
            <p class="history-input">${this.escapeHtml(item.input)}</p>
            <p class="history-output">${this.escapeHtml(item.output)}</p>
          </section>
          <aside class="history-meta">
            <time datetime="${item.timestamp}">${new Date(item.timestamp).toLocaleTimeString()}</time>
          </aside>
        </article>
      `;
      
      // Add click handler to restore translation
      historyItem.addEventListener('click', () => {
        this.restoreFromHistory(item);
      });
      
      this.elements.historyList.appendChild(historyItem);
    });
  }

  /**
   * Restores translation from history
   * @param {object} item - History item
   */
  restoreFromHistory(item) {
    // Set mode
    const modeRadio = document.querySelector(`input[name="mode"][value="${item.mode}"]`);
    if (modeRadio) {
      modeRadio.checked = true;
      this.handleModeChange();
    }
    
    // Set input and output
    this.elements.inputText.value = item.input;
    this.elements.outputText.value = item.output;
    
    // Focus input
    this.elements.inputText.focus();
    
    this.showNotification('Translation restored from history', 'success');
  }

  /**
   * Escapes HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span.innerHTML;
  }

  /**
   * Loads translation history from localStorage
   * @returns {Array} History array
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('emoji_translator_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * Saves translation history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('emoji_translator_history', JSON.stringify(this.translationHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  /**
   * Updates UI based on current state
   */
  updateUI() {
    this.updateHistoryDisplay();
    
    // Check Gemini service status
    const status = this.aiService.getStatus();
    if (!status.available) {
      this.showNotification('Gemini API key not configured. Please set GEMINI_API_KEY in constants.js file.', 'error');
    }
  }

  /**
   * Sets AI service API key
   * @param {string} apiKey - API key
   */
  setApiKey(apiKey) {
    this.aiService.setApiKey(apiKey);
    this.showNotification('API key configured successfully!', 'success');
  }

  /**
   * Gets current AI service status
   * @returns {object} Service status
   */
  getServiceStatus() {
    return this.aiService.getStatus();
  }
}
