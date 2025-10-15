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
      helpSection: document.querySelector('.help-section')
    };
    // Monkey loader
    this.elements.monkeyLoader = document.createElement('main');
    this.elements.monkeyLoader.className = 'monkey-loader';
    this.elements.monkeyLoader.innerHTML = `
      <img src="./assets/monkey.gif" style="
        translate: -50% -50%;
        position: absolute;
        top: 50%; 
        alt="Monkey loading" />
    `;
    Object.assign(this.elements.monkeyLoader.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      display: 'none',
      zIndex: '1000',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
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
        duration: 1000,
        imageSize: 50,
        imageUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b8.png'
      });
      
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
      this.elements.translateButton.textContent = '🔄 Let the monkeys translate';
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
   * Updates UI based on current state
   */
  updateUI() {
    
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
