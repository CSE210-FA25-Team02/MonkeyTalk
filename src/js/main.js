/**
 * Main application entry point for Emoji Speak Translator
 * Initializes the application and coordinates modules
 */

import { UIController } from './modules/ui-controller.js';
import { createAIService, getAvailableServices } from './modules/ai-service.js';

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
      
      // Set up service configuration
      this.setupServiceConfiguration();
      
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
   * Sets up service configuration UI
   */
  setupServiceConfiguration() {
    // Create service configuration section
    const configSection = document.createElement('section');
    configSection.className = 'service-config';
    configSection.innerHTML = `
      <details>
        <summary>AI Service Configuration</summary>
        <article class="config-content">
          <p>Configure your AI service for better translations:</p>
          <fieldset class="service-selection">
            <legend>Service Selection</legend>
            <label for="service-select">Service:</label>
            <select id="service-select">
              <option value="openai">OpenAI GPT</option>
              <option value="huggingface">Hugging Face</option>
              <option value="freeapi">Free API (Fallback)</option>
            </select>
          </fieldset>
          <fieldset class="api-key-input">
            <legend>API Configuration</legend>
            <label for="api-key">API Key (optional):</label>
            <input type="password" id="api-key" placeholder="Enter your API key">
            <button id="save-api-key" type="button">Save</button>
          </fieldset>
          <aside class="service-status">
            <span id="service-status">Checking service status...</span>
          </aside>
        </article>
      </details>
    `;

    // Insert before the help section
    const helpSection = document.querySelector('.help-section');
    helpSection.parentNode.insertBefore(configSection, helpSection);

    // Bind configuration events
    this.bindConfigurationEvents();
  }

  /**
   * Binds configuration events
   */
  bindConfigurationEvents() {
    const serviceSelect = document.getElementById('service-select');
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save-api-key');
    const statusSpan = document.getElementById('service-status');

    // Service selection change
    serviceSelect.addEventListener('change', () => {
      const serviceName = serviceSelect.value;
      this.uiController.aiService = createAIService(serviceName);
      this.updateServiceStatus();
    });

    // Save API key
    saveButton.addEventListener('click', () => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        this.uiController.setApiKey(apiKey);
        this.updateServiceStatus();
      } else {
        this.uiController.showNotification('Please enter a valid API key', 'error');
      }
    });

    // Update status on load
    this.updateServiceStatus();
  }

  /**
   * Updates service status display
   */
  updateServiceStatus() {
    const statusSpan = document.getElementById('service-status');
    const status = this.uiController.getServiceStatus();
    
    if (status.available) {
      statusSpan.textContent = `✅ ${status.service} service is available`;
      statusSpan.className = 'status-success';
    } else {
      statusSpan.textContent = `⚠️ ${status.service} service requires API key`;
      statusSpan.className = 'status-warning';
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
