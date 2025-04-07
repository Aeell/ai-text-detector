const { UIController } = require('../src/js/UIController');

// Mocks for dependencies
const mockAIDetector = {
  analyzeText: jest.fn().mockResolvedValue({
    text: 'Test text',
    aiProbability: 0.7,
    confidence: 0.9,
    language: 'en',
    metrics: {
      wordCount: 10,
      sentenceCount: 2,
      readabilityScore: 80
    }
  }),
  compareTexts: jest.fn().mockResolvedValue({
    text1Analysis: { aiProbability: 0.7 },
    text2Analysis: { aiProbability: 0.3 },
    similarity: 0.4
  })
};

const mockStorageService = {
  getUserPreferences: jest.fn().mockReturnValue({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    accessibility: {
      highContrast: false,
      reducedMotion: false
    }
  }),
  saveUserPreferences: jest.fn().mockReturnValue(true),
  saveAnalysis: jest.fn().mockReturnValue(true),
  getAnalysisHistory: jest.fn().mockReturnValue([])
};

const mockAnalyticsService = {
  trackEvent: jest.fn().mockResolvedValue(true),
  trackError: jest.fn().mockResolvedValue(true)
};

// Mock DOM elements
document.body.innerHTML = `
  <header class="app-header">
    <nav class="main-nav">
      <div class="logo">AI Text Detector</div>
      <div class="nav-controls">
        <select id="language-selector">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
        <button id="theme-toggle">Toggle Theme</button>
        <button id="settings-button">Settings</button>
      </div>
    </nav>
  </header>
  <main>
    <section id="input-section">
      <div class="text-input-container">
        <textarea id="text-input" placeholder="Enter text to analyze"></textarea>
        <div class="input-controls">
          <button id="analyze-button">Analyze Text</button>
          <button id="clear-button">Clear</button>
        </div>
      </div>
    </section>
    <section id="loading-section" class="hidden">
      <div class="loader"></div>
      <p>Analyzing text...</p>
    </section>
    <section id="error-section" class="hidden">
      <div class="error-message"></div>
    </section>
    <section id="results-section" class="hidden">
      <div class="result-card">
        <h2>Analysis Results</h2>
        <div id="results-container"></div>
      </div>
    </section>
    <section id="comparison-section" class="hidden">
      <div class="comparison-inputs">
        <textarea id="text1-input" placeholder="Enter first text"></textarea>
        <textarea id="text2-input" placeholder="Enter second text"></textarea>
        <button id="compare-button">Compare Texts</button>
      </div>
      <div id="comparison-results"></div>
    </section>
  </main>
  <div id="settings-modal" class="modal hidden">
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Settings</h2>
      <form id="settings-form">
        <div class="setting-group">
          <label for="font-size">Font Size</label>
          <select id="font-size">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="high-contrast"> High Contrast
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="reduced-motion"> Reduced Motion
          </label>
        </div>
        <button type="submit" id="save-settings">Save Settings</button>
      </form>
    </div>
  </div>
`;

describe('UIController', () => {
  let uiController;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset DOM state
    document.querySelectorAll('.hidden').forEach(el => el.classList.add('hidden'));
    document.getElementById('text-input').value = '';
    document.getElementById('text1-input').value = '';
    document.getElementById('text2-input').value = '';
    
    // Create new controller instance
    uiController = new UIController(mockAIDetector, mockStorageService, mockAnalyticsService);
    uiController.init();
  });

  describe('Initialization', () => {
    it('should properly initialize and cache DOM elements', () => {
      expect(uiController.elements.textInput).toBeDefined();
      expect(uiController.elements.analyzeButton).toBeDefined();
      expect(uiController.elements.resultsSection).toBeDefined();
    });

    it('should apply user preferences on initialization', () => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.getElementById('language-selector').value).toBe('en');
    });
  });

  describe('Text Analysis', () => {
    it('should handle text analysis when analyze button is clicked', async () => {
      const textInput = document.getElementById('text-input');
      textInput.value = 'Test text for analysis';
      
      const analyzeButton = document.getElementById('analyze-button');
      analyzeButton.click();
      
      // Should show loading indicator
      expect(document.getElementById('loading-section').classList.contains('hidden')).toBe(false);
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should call AI detector
      expect(mockAIDetector.analyzeText).toHaveBeenCalledWith('Test text for analysis');
      
      // Should hide loading and show results
      expect(document.getElementById('loading-section').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('results-section').classList.contains('hidden')).toBe(false);
      
      // Should save analysis to storage
      expect(mockStorageService.saveAnalysis).toHaveBeenCalled();
      
      // Should track event
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalled();
    });

    it('should display error when text is too short', async () => {
      const textInput = document.getElementById('text-input');
      textInput.value = 'Hi';
      
      const analyzeButton = document.getElementById('analyze-button');
      analyzeButton.click();
      
      // Should show error section
      expect(document.getElementById('error-section').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('.error-message').textContent).toContain('too short');
      
      // Should not call AI detector
      expect(mockAIDetector.analyzeText).not.toHaveBeenCalled();
    });
  });

  describe('Text Comparison', () => {
    it('should handle text comparison when compare button is clicked', async () => {
      document.getElementById('text1-input').value = 'First test text';
      document.getElementById('text2-input').value = 'Second test text';
      
      document.getElementById('compare-button').click();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should call compareTexts method
      expect(mockAIDetector.compareTexts).toHaveBeenCalledWith('First test text', 'Second test text');
      
      // Should display comparison results
      expect(document.getElementById('comparison-results').innerHTML).not.toBe('');
    });
  });

  describe('UI Controls', () => {
    it('should clear input when clear button is clicked', () => {
      const textInput = document.getElementById('text-input');
      textInput.value = 'Test text';
      
      document.getElementById('clear-button').click();
      
      expect(textInput.value).toBe('');
      expect(document.getElementById('results-section').classList.contains('hidden')).toBe(true);
    });

    it('should toggle theme when theme button is clicked', () => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      
      document.getElementById('theme-toggle').click();
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(mockStorageService.saveUserPreferences).toHaveBeenCalled();
    });

    it('should change language when language selector is changed', () => {
      const languageSelector = document.getElementById('language-selector');
      languageSelector.value = 'es';
      
      // Dispatch change event
      const event = new Event('change');
      languageSelector.dispatchEvent(event);
      
      expect(mockStorageService.saveUserPreferences).toHaveBeenCalled();
    });
  });

  describe('Settings Modal', () => {
    it('should open settings modal when settings button is clicked', () => {
      const settingsModal = document.getElementById('settings-modal');
      expect(settingsModal.classList.contains('hidden')).toBe(true);
      
      document.getElementById('settings-button').click();
      
      expect(settingsModal.classList.contains('hidden')).toBe(false);
    });

    it('should save settings when form is submitted', () => {
      // Open settings modal
      document.getElementById('settings-button').click();
      
      // Change settings
      document.getElementById('font-size').value = 'large';
      document.getElementById('high-contrast').checked = true;
      
      // Submit form
      const form = document.getElementById('settings-form');
      form.dispatchEvent(new Event('submit'));
      
      expect(mockStorageService.saveUserPreferences).toHaveBeenCalledWith(
        expect.objectContaining({
          fontSize: 'large',
          accessibility: expect.objectContaining({
            highContrast: true
          })
        })
      );
      
      // Should close modal
      expect(document.getElementById('settings-modal').classList.contains('hidden')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle analysis errors gracefully', async () => {
      // Mock AIDetector to throw an error
      mockAIDetector.analyzeText.mockRejectedValueOnce(new Error('Analysis failed'));
      
      document.getElementById('text-input').value = 'Test text that will cause error';
      document.getElementById('analyze-button').click();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should show error message
      expect(document.getElementById('error-section').classList.contains('hidden')).toBe(false);
      expect(document.querySelector('.error-message').textContent).toContain('failed');
      
      // Should track error
      expect(mockAnalyticsService.trackError).toHaveBeenCalled();
    });
  });

  describe('Display Functions', () => {
    it('should correctly format and display analysis results', async () => {
      document.getElementById('text-input').value = 'Test text for display testing';
      document.getElementById('analyze-button').click();
      
      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const resultsContainer = document.getElementById('results-container');
      
      // Check that results contain key metrics
      expect(resultsContainer.innerHTML).toContain('AI Probability');
      expect(resultsContainer.innerHTML).toContain('70%'); // 0.7 as percentage
      expect(resultsContainer.innerHTML).toContain('Confidence');
      expect(resultsContainer.innerHTML).toContain('90%'); // 0.9 as percentage
    });
  });
}); 