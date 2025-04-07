import { UIController } from '../ui-controller.js';

describe('UIController', () => {
  let ui;
  
  beforeEach(() => {
    // Mock AIDetector
    window.AIDetector = class {
      analyzeTextDetailed(text) {
        return {
          aiScore: 75,
          confidence: 0.8,
          metrics: {},
          wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
          sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
          avgSentenceLength: 5,
          uniqueWords: 2,
          repetitionScore: 0,
          sentenceLengthVariance: 0,
          transitionPhrases: 0,
          factors: {
            baseline: 20,
            sentenceLength: 25,
            vocabulary: 20,
            variance: 0,
            transitions: 0,
            density: 0
          }
        };
      }
    };

    document.body.innerHTML = `
      <h1></h1>
      <header><p></p></header>
      <div class="theme-banner"></div>
      <div class="input-section"><p></p></div>
      <div id="result"></div>
      <div id="compareResult"></div>
      <div id="wordCount"></div>
      <div id="repeatWords"></div>
      <div id="sentenceCount"></div>
      <div id="readability"></div>
      <textarea id="inputText"></textarea>
      <textarea id="compareText"></textarea>
      <select id="langSelect"></select>
      <button id="analyzeBtn"></button>
      <button id="compareBtn"></button>
      <button id="exportBtn"></button>
      <button id="shareBtn"></button>
      <button id="clearBtn"></button>
      <button id="themeToggle"></button>
      <div class="sidebar"><h3></h3></div>
      <footer><p></p></footer>
    `;
    ui = new UIController();
  });

  describe('language switching', () => {
    it('should switch UI language correctly', () => {
      ui.switchLang('ENG');
      expect(document.getElementById('analyzeBtn').innerHTML).toBe('Analyze');
      expect(document.querySelector('h1').innerHTML).toBe('AI Text Detector');
      
      // Test only English for now as other languages are not implemented
      expect(document.querySelector('.input-section p').innerHTML).toBe('Enter or paste text to analyze:');
    });
  });

  describe('theme handling', () => {
    it('should toggle theme correctly', () => {
      ui.toggleTheme();
      expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
      expect(document.getElementById('themeToggle').textContent).toBe('☀️');
      
      ui.toggleTheme();
      expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
      expect(document.getElementById('themeToggle').textContent).toBe('🌙');
    });
  });

  describe('text analysis', () => {
    it('should handle empty text input', () => {
      document.getElementById('inputText').value = '';
      ui.detectAI();
      expect(document.getElementById('result').innerHTML).toBe('Please enter some text to analyze');
    });

    it('should analyze text correctly', () => {
      document.getElementById('inputText').value = 'Test sentence.';
      ui.detectAI();
      expect(document.getElementById('result').innerHTML).not.toBe('');
      expect(document.getElementById('wordCount').textContent).toBe('2');
    });
  });

  describe('offline handling', () => {
    it('should show offline message', () => {
      ui.showOfflineMessage();
      const offlineMessage = document.querySelector('.offline-message');
      expect(offlineMessage).not.toBeNull();
      expect(offlineMessage.textContent).toBe('You are currently offline. Some features may be limited.');
    });

    it('should show online message', () => {
      ui.showOnlineMessage();
      const onlineMessage = document.querySelector('.online-message');
      expect(onlineMessage).not.toBeNull();
      expect(onlineMessage.textContent).toBe('You are back online!');
    });
  });
}); 