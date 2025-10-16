/**
 * Main application entry point for Emoji Speak Translator
 * Initializes the application and coordinates modules
 */

import { UIController } from './modules/ui-controller.js';

class EmojiTranslatorApp {
  constructor() {
    this.uiController = null;
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * Initializes the application
   */
  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeApp());
      } else {
        this.initializeApp();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application');
    }
  }

  /**
   * Initializes the application components
   */
  initializeApp() {
    try {
      // Initialize UI controller
      this.uiController = new UIController();
      
      // Gemini API is configured via environment variable
      
      // Add global error handling
      this.setupErrorHandling();
      
      // Mark as initialized
      this.isInitialized = true;
      
      console.log('Emoji Speak Translator initialized successfully');
      
    } catch (error) {
      console.error('App initialization error:', error);
      this.showError('Application initialization failed');
    }
  }


  /**
   * Sets up global error handling
   */
  setupErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('An unexpected error occurred');
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.showError('An error occurred in the application');
    });
  }

  /**
   * Shows error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    // Create error notification
    const errorDialog = document.createElement('dialog');
    errorDialog.className = 'error-notification';
    errorDialog.innerHTML = `
      <article class="error-content">
        <header>
          <h3>Error</h3>
        </header>
        <main>
          <p>${message}</p>
        </main>
        <footer>
          <button onclick="this.closest('dialog').close()">Close</button>
        </footer>
      </article>
    `;

    // Style the error notification
    Object.assign(errorDialog.style, {
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      maxWidth: '400px',
      textAlign: 'center',
      border: 'none'
    });

    document.body.appendChild(errorDialog);
    errorDialog.showModal();
  }

  /**
   * Gets application statistics
   * @returns {object} App statistics
   */
  getStats() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      translations: this.uiController.translationHistory.length,
      serviceStatus: this.uiController.getServiceStatus(),
      isInitialized: this.isInitialized
    };
  }
}

// Initialize the application
const app = new EmojiTranslatorApp();

// Export for debugging/testing
window.EmojiTranslatorApp = app;

// Add some utility functions to global scope for debugging
window.debugApp = {
  getStats: () => app.getStats(),
  getHistory: () => app.uiController?.translationHistory || [],
  clearHistory: () => {
    if (app.uiController) {
      app.uiController.translationHistory = [];
      app.uiController.saveHistory();
      app.uiController.updateHistoryDisplay();
    }
  },
  setApiKey: (key) => {
    if (app.uiController) {
      app.uiController.setApiKey(key);
    }
  }
};

console.log('Emoji Speak Translator loaded. Use window.debugApp for debugging.');
