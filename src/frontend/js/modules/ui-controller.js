/**
 * UI Controller for Emoji Speak Translator
 * Handles DOM manipulation and user interactions
 */

import { buttonSound, monkeySound } from './sounds.js';
import { startMoneyRain } from './dollar-rain.js';
import { TeasingEngine } from './teasing-engine.js';

export class UIController {
  constructor() {
    this.isTranslating = false;
    this.teasingEngine = new TeasingEngine();
    
    this.initializeElements();
    this.bindEvents();
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
      minWidth: '100vw',
      minHeight: '100vh',
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

  playButtonClick() {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(err => console.error(err));
  }

  playMonkeySound() {
    monkeySound.currentTime = 0;
    monkeySound.play();
  }

  /**
   * Handles mode change between text-to-emoji and emoji-to-text
   */
  handleModeChange() {
    // Play Button Sound
    this.playButtonClick();

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
    // Play Button Sound
    this.playButtonClick();

    const text = this.elements.inputText.value.trim();
    if (!text) {
      this.showNotification('Please enter some text to translate', 'error');
      return;
    }
    this.translateText(text);
  }

  /**
   * Translates text using AI service with teasing elements
   * @param {string} text - Text to translate
   */
  async translateText(text) {
    if (!text.trim()) {
      this.elements.outputText.value = '';
      return;
    }

    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    
    try {
      // Determine mode
      const mode = selectedMode;

      // PRE-TRANSLATION: Pure random tease (no LLM)
      const preTeaseMessage = this.teasingEngine.getPreTranslationTease();
      this.elements.outputText.value = preTeaseMessage;
      this.elements.outputText.classList.add('teasing-pre');
      
      // Wait a bit to show the tease
      // TODO: Make this delay to be actually waiting for the gemini to do the translation?
      // TODO: if we want to do content based teasing, we need to call gemini here separately and then show the teasing message based on the content.
      await this.teasingEngine.delay(1200);
      
      this.setLoadingState(true);

      const response = await fetch('https://emoji-translate.indresh.me/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, mode: selectedMode })
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      const translation = data.translation;


      const postTeasePromise = fetch('https://emoji-translate.indresh.me/teasing-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: text, mode: mode })
      })
      .then(res => res.json())
      .catch(() => null);

      // Show result and then remove teasing style
      this.elements.outputText.value = translation;
      this.elements.outputText.classList.remove('teasing-pre');
      

      // POST-TEASING: Prefer LLM banner; fallback to monkey-energy loading tease
      const analysisResult = await postTeasePromise;
      const banner = analysisResult && analysisResult.shortTease
        ? analysisResult.shortTease
        : this.teasingEngine.buildLoadingTease(mode);
      await this.teasingEngine.delay(300);
      this.showTeasingNotification(banner);

      // Hide monkey loader
      this.setLoadingState(false);

      // Trigger falling money effect (optimized for FPS)
      startMoneyRain({
        numBills: 150,
        duration: 1000,
        imageSize: 50,
        imageUrl: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f4b8.png'
      });
      
      //Play Monkey Applause When Translation Finishes
      this.playMonkeySound();

    } catch (error) {
      console.error('Translation error:', error);
      this.elements.outputText.classList.remove('teasing-pre');
      this.elements.outputText.value = 'Translation failed. Please check your API key configuration.';
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Handles copy button click
   */
  async handleCopyClick() {
    // Play Button Sound
    this.playButtonClick();

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
   * Shows teasing notification with special styling
   * @param {string} message - Teasing message
   */
  showTeasingNotification(message) {
    const notification = document.createElement('aside');
    notification.className = 'teasing-notification';
    notification.innerHTML = `🍌 ${message}`;
    
    // Special styling for teasing notifications
  Object.assign(notification.style, {
    position: 'fixed',
    top: '40px',
    right: '30px',
    padding: '20px 40px',
    borderRadius: '70% 80% 60% 80% / 60% 90% 50% 80%',
    transformOrigin: 'center bottom',
    transform: 'rotate(-10deg) translateX(100%) scale(0.9)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '15px',
    zIndex: '1000',
    textAlign: 'center',
    letterSpacing: '0.5px',
    border: '2px solid rgba(255,255,255,0.3)',
    boxShadow: '0 0 25px rgba(255,255,255,0.6)',
    background: 'linear-gradient(270deg, #ffcc33, #ff9966, #ff66cc, #6699ff, #33ff99, #ffff66)',
    backgroundSize: '400% 400%',
    animation: 'bananaRainbow 6s linear infinite, bananaSwing 2.8s ease-in-out infinite',
    transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    maxWidth: '340px',
    backdropFilter: 'blur(6px)'
  });
    document.body.appendChild(notification);
    
    // Animate in with bounce effect
    setTimeout(() => {
      notification.style.transform = 'rotate(-10deg) translateX(0) scale(1)';
    }, 100);
      
    // Remove after 4 seconds (longer for teasing messages)
    setTimeout(() => {
      notification.style.transform = 'rotate(-10deg) translateX(100%) scale(0.8)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 400);
    }, 4000);
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
}