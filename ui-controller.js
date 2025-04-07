// ui-controller.js - UI interactions and DOM manipulation for AI Text Detector

/**
 * Current language code
 * @type {string}
 */
let currentLang = "ENG";

/**
 * Translations for all supported languages
 * @type {Object}
 */
const translations = {
  CZE: {
    title: "Detektor AI Úkolů", subtitle: "Pro učitele, rodiče a čestné studenty", banner: "Chyťte podvodníky s AI během několika sekund!",
    prompt: "Vložte text studenta k odhalení AI generovaného obsahu.", placeholder: "Vložte text zde (např. domácí úkoly, eseje)...",
    comparePlaceholder: "Vložte druhý text pro porovnání...", analyze: "Analyzovat text", compare: "Porovnat texty",
    export: "Exportovat výsledky", share: "Sdílet: 𝕏", clear: "Vyčistit", tipsTitle: "Tipy pro učitele",
    tipsText: "<ul><li><strong>Jednotné věty:</strong> Text AI má často konzistentní délku vět.</li><li><strong>Vyleštěné fráze:</strong> Hledejte příliš úhlednou prózu bez chyb.</li><li><strong>Přepjaté přechody:</strong> Všímajte si frází jako 'závěrem'.</li></ul>",
    footer: "Vytvořeno pro podporu čestné práce | <a href='mailto:your-email@example.com'>Kontaktujte nás</a>",
    noText: "Zadejte text k analýze.", aiLabel: "Pravděpodobnost AI:", likelyAI: "Pravděpodobně generováno AI",
    likelyHuman: "Pravděpodobně napsáno člověkem", compareResult: "Porovnání: Text 1 - {score1}%, Text 2 - {score2}%",
    wordCount: "Počet slov: {count}", repeatWords: "Opakující se slova: {list}", sentenceCount: "Počet vět: {count}",
    readability: "Čitelnost (Flesch): {score}",
    darkMode: "Tmavý režim", lightMode: "Světlý režim"
  },
  ENG: {
    title: "AI Homework Detector", subtitle: "For Teachers, Parents, and Honest Students", banner: "Catch AI Cheaters in Seconds!",
    prompt: "Paste student text to detect AI-generated homework.", placeholder: "Paste text here (e.g., homework, essays)...",
    comparePlaceholder: "Paste second text to compare...", analyze: "Analyze Text", compare: "Compare Texts",
    export: "Export Results", share: "Share: 𝕏", clear: "Clear", tipsTitle: "Tips for Teachers",
    tipsText: "<ul><li><strong>Uniform Sentences:</strong> AI text often has consistent sentence lengths.</li><li><strong>Polished Phrasing:</strong> Look for overly neat prose without errors.</li><li><strong>Overused Transitions:</strong> Spot phrases like 'in conclusion'.</li></ul>",
    footer: "Built to promote honest work | <a href='mailto:your-email@example.com'>Contact Us</a>",
    noText: "Please enter some text to analyze.", aiLabel: "AI Likelihood:", likelyAI: "Likely AI-generated",
    likelyHuman: "Likely human-written", compareResult: "Comparison: Text 1 - {score1}%, Text 2 - {score2}%",
    wordCount: "Word Count: {count}", repeatWords: "Repeating Words: {list}", sentenceCount: "Sentence Count: {count}",
    readability: "Readability (Flesch): {score}",
    darkMode: "Dark Mode", lightMode: "Light Mode"
  },
  DE: {
    title: "KI-Hausaufgabendetektor", subtitle: "Für Lehrer, Eltern und ehrliche Schüler", banner: "Fange KI-Betrüger in Sekunden!",
    prompt: "Füge den Schülertext ein, um KI-generierte Hausaufgaben zu erkennen.", placeholder: "Text hier einfügen (z.B. Hausaufgaben, Aufsätze)...",
    comparePlaceholder: "Zweiten Text zum Vergleichen einfügen...", analyze: "Text analysieren", compare: "Texte vergleichen",
    export: "Ergebnisse exportieren", share: "Teilen: 𝕏", clear: "Löschen", tipsTitle: "Tipps für Lehrer",
    tipsText: "<ul><li><strong>Einheitliche Sätze:</strong> KI-Texte haben oft konsistente Satzlangen.</li><li><strong>Geschliffene Formulierungen:</strong> Achte auf zu perfekte Prosa.</li><li><strong>Übermäßig genutzte Übergänge:</strong> Suche nach Phrasen wie 'zum Schluss'.</li></ul>",
    footer: "Entwickelt zur Förderung ehrlicher Arbeit | <a href='mailto:your-email@example.com'>Kontaktieren Sie uns</a>",
    noText: "Bitte geben Sie einen Text zur Analyse ein.", aiLabel: "KI-Wahrscheinlichkeit:", likelyAI: "Wahrscheinlich KI-generiert",
    likelyHuman: "Wahrscheinlich menschlich geschrieben", compareResult: "Vergleich: Text 1 - {score1}%, Text 2 - {score2}%",
    wordCount: "Wortanzahl: {count}", repeatWords: "Wiederholte Wörter: {list}", sentenceCount: "Satzanzahl: {count}",
    readability: "Lesbarkeit (Flesch): {score}",
    darkMode: "Dunkelmodus", lightMode: "Hellmodus"
  },
  FR: {
    title: "Détecteur de Devoirs IA", subtitle: "Pour les enseignants, les parents et les élèves honnêtes", banner: "Attrapez les tricheurs IA en quelques secondes !",
    prompt: "Collez le texte de l'élève pour détecter les devoirs générés par IA.", placeholder: "Collez le texte ici (ex. devoirs, essais)...",
    comparePlaceholder: "Collez un second texte à comparer...", analyze: "Analyser le texte", compare: "Comparer les textes",
    export: "Exporter les résultats", share: "Partager: 𝕏", clear: "Effacer", tipsTitle: "Conseils pour les enseignants",
    tipsText: "<ul><li><strong>Phrases uniformes :</strong> Les textes IA ont souvent des longueurs de phrases constantes.</li><li><strong>Formulations soignées :</strong> Recherchez une prose trop parfaite.</li><li><strong>Transitions surutilisées :</strong> Repérez des expressions comme 'en conclusion'.</li></ul>",
    footer: "Conçu pour promouvoir un travail honnête | <a href='mailto:your-email@example.com'>Contactez-nous</a>",
    noText: "Veuillez entrer un texte à analyser.", aiLabel: "Probabilité IA :", likelyAI: "Probablement généré par IA",
    likelyHuman: "Probablement écrit par un humain", compareResult: "Comparaison : Texte 1 - {score1}%, Texte 2 - {score2}%",
    wordCount: "Nombre de mots: {count}", repeatWords: "Mots répétés: {list}", sentenceCount: "Nombre de phrases: {count}",
    readability: "Lisibilité (Flesch): {score}",
    darkMode: "Mode sombre", lightMode: "Mode clair"
  },
  ES: {
    title: "Detector de Tareas IA", subtitle: "Para maestros, padres y estudiantes honestos", banner: "¡Atrapa a los tramposos con IA en segundos!",
    prompt: "Pega el texto del estudiante para detectar tareas generadas por IA.", placeholder: "Pega el texto aquí (ej. tareas, ensayos)...",
    comparePlaceholder: "Pega un segundo texto para comparar...", analyze: "Analizar texto", compare: "Comparar textos",
    export: "Exportar resultados", share: "Compartir: 𝕏", clear: "Limpiar", tipsTitle: "Consejos para maestros",
    tipsText: "<ul><li><strong>Oraciones uniformes:</strong> El texto de IA suele tener longitudes de frases consistentes.</li><li><strong>Frases pulidas:</strong> Busca una prosa demasiado perfecta.</li><li><strong>Transiciones sobreutilizadas:</strong> Identifica frases como 'en conclusión'.</li></ul>",
    footer: "Creado para promover el trabajo honesto | <a href='mailto:your-email@example.com'>Contáctenos</a>",
    noText: "Por favor, ingrese un texto para analizar.", aiLabel: "Probabilidad de IA:", likelyAI: "Probablemente generado por IA",
    likelyHuman: "Probablemente escrito por humanos", compareResult: "Comparación: Texto 1 - {score1}%, Text 2 - {score2}%",
    wordCount: "Conteo de palabras: {count}", repeatWords: "Palabras repetidas: {list}", sentenceCount: "Conteo de frases: {count}",
    readability: "Legibilidad (Flesch): {score}",
    darkMode: "Modo oscuro", lightMode: "Modo claro"
  },
  UK: {
    title: "Детектор домашніх завдань ШІ", subtitle: "Для вчителів, батьків та чесних учнів", banner: "Ловіть шахраїв ШІ за секунди!",
    prompt: "Вставте текст учня для виявлення вмісту, згенерованого ШІ.", placeholder: "Вставте текст тут (напр. домашні завдання, есе)...",
    comparePlaceholder: "Вставте другий текст для порівняння...", analyze: "Аналізувати текст", compare: "Порівняти тексти",
    export: "Експортувати результати", share: "Поділитися: 𝕏", clear: "Очистити", tipsTitle: "Поради для вчителів",
    tipsText: "<ul><li><strong>Однакові речення:</strong> Текст ШІ часто має постійну довжину речень.</li><li><strong>Відшліфовані фрази:</strong> Шукайте надто ідеальну прозу.</li><li><strong>Надмірні переходи:</strong> Звертайте увагу на фрази типу 'на завершення'.</li></ul>",
    footer: "Створено для підтримки чесної роботи | <a href='mailto:your-email@example.com'>Зв'яжіться з нами</a>",
    noText: "Будь ласка, введіть текст для аналізу.", aiLabel: "Ймовірність ШІ:", likelyAI: "Ймовірно згенеровано ШІ",
    likelyHuman: "Ймовірно написано людиною", compareResult: "Порівняння: Текст 1 - {score1}%, Текст 2 - {score2}%",
    wordCount: "Кількість слів: {count}", repeatWords: "Повторювані слова: {list}", sentenceCount: "Кількість речень: {count}",
    readability: "Читабельність (Flesch): {score}",
    darkMode: "Темний режим", lightMode: "Світлий режим"
  },
  RU: {
    title: "Детектор домашних заданий ИИ", subtitle: "Для учителей, родителей и честных учеников", banner: "Лови мошенников с ИИ за секунды!",
    prompt: "Вставьте текст ученика для выявления контента, созданного ИИ.", placeholder: "Вставьте текст здесь (напр. домашние задания, эссе)...",
    comparePlaceholder: "Вставьте второй текст для сравнения...", analyze: "Анализировать текст", compare: "Сравнить тексты",
    export: "Экспортировать результаты", share: "Поделиться: 𝕏", clear: "Очистить", tipsTitle: "Советы для учителей",
    tipsText: "<ul><li><strong>Одинаковые предложения:</strong> Текст ИИ часто имеет постоянную длину предложений.</li><li><strong>Отшлифованные фразы:</strong> Ищите слишком идеальную прозу.</li><li><strong>Чрезмерно используемые переходы:</strong> Обратите внимание на фразы вроде 'в заключение'.</li></ul>",
    footer: "Создано для поддержки честной работы | <a href='mailto:your-email@example.com'>Свяжитесь с нами</a>",
    noText: "Пожалуйста, введите текст для анализа.", aiLabel: "Вероятность ИИ:", likelyAI: "Вероятно сгенерировано ИИ",
    likelyHuman: "Вероятно написано человеком", compareResult: "Сравнение: Текст 1 - {score1}%, Текст 2 - {score2}%",
    wordCount: "Количество слов: {count}", repeatWords: "Повторяющиеся слова: {list}", sentenceCount: "Количество предложений: {count}",
    readability: "Читаемость (Flesch): {score}",
    darkMode: "Темный режим", lightMode: "Светлый режим"
  }
};

export class UIController {
  constructor() {
    this.currentLang = "ENG";
    this.translations = {
      ENG: {
        title: "AI Text Detector",
        subtitle: "Analyze text for AI-generated content",
        banner: "Switch theme for better readability",
        prompt: "Enter or paste text to analyze:",
        placeholder: "Enter text here...",
        comparePlaceholder: "Enter text to compare...",
        analyze: "Analyze",
        compare: "Compare",
        export: "Export",
        share: "Share",
        clear: "Clear",
        tipsTitle: "Writing Tips",
        footer: "© 2024 AI Text Detector",
        noText: "Please enter some text to analyze",
        likelyAI: "Likely AI-generated",
        likelyHuman: "Likely human-written",
        aiLabel: "AI Probability:",
        offline: "You are currently offline. Some features may be limited.",
        online: "You are back online!"
      }
      // Add other languages as needed
    };
    
    this.init();
  }
  
  init() {
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', () => {
        this.switchLang("ENG");
        this.addThemeToggle();
        this.loadThemePreference();
        this.setupEventListeners();
        this.addAccessibilityFeatures();
      });
    }
  }
  
  switchLang(lang) {
    this.currentLang = lang;
    const t = this.translations[lang];
    
    if (typeof document === 'undefined') return;
    
    // Update page title and header
    document.querySelector("h1").innerHTML = t.title;
    document.querySelector("header p").innerHTML = t.subtitle;
    document.querySelector(".theme-banner").innerHTML = t.banner;
    
    // Update input section
    document.querySelector(".input-section p").innerHTML = t.prompt;
    document.getElementById("inputText").placeholder = t.placeholder;
    document.getElementById("compareText").placeholder = t.comparePlaceholder;
    
    // Update buttons
    document.getElementById("analyzeBtn").innerHTML = t.analyze;
    document.getElementById("compareBtn").innerHTML = t.compare;
    document.getElementById("exportBtn").innerHTML = t.export;
    document.getElementById("shareBtn").innerHTML = t.share;
    document.getElementById("clearBtn").innerHTML = t.clear;
    
    // Update sidebar
    document.querySelector(".sidebar h3").innerHTML = t.tipsTitle;
    this.updateTips(t);
    
    // Update footer
    document.querySelector("footer p").innerHTML = t.footer;
    
    // Update theme toggle button
    this.updateThemeToggleText();
    
    // Re-run analysis if text exists
    this.detectAI();
    
    // Save language preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aiDetectorLang', lang);
    }
  }
  
  updateTips(translations) {
    const tips = document.querySelectorAll('.tip');
    // Update tips with translations
    // This is a placeholder - actual tips would come from translations
  }
  
  updateThemeToggleText() {
    if (typeof document === 'undefined') return;
    
    const themeToggle = document.getElementById('themeToggle');
    const isDark = document.documentElement.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  
  toggleTheme() {
    if (typeof document === 'undefined') return;
    
    const isDarkMode = document.documentElement.classList.toggle('dark-theme');
    document.body.classList.toggle('dark-theme');
    this.updateThemeToggleText();
    
    // Save preference
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aiDetectorTheme', isDarkMode ? 'dark' : 'light');
    }
  }
  
  detectAI() {
    if (typeof document === 'undefined') return;
    
    const text = document.getElementById("inputText").value.trim();
    if (!text) {
      document.getElementById("result").innerHTML = this.translations[this.currentLang].noText;
      document.getElementById("compareResult").innerHTML = "";
      this.clearStats();
      return;
    }
    
    try {
      // Use the AIDetector module to analyze text
      const detector = new window.AIDetector();
      const analysis = detector.analyzeTextDetailed(text);
      const resultText = analysis.aiScore > 50 ? 
        this.translations[this.currentLang].likelyAI : 
        this.translations[this.currentLang].likelyHuman;
      
      // Display result
      const resultElement = document.getElementById("result");
      resultElement.innerHTML = `${this.translations[this.currentLang].aiLabel} ${analysis.aiScore}% - ${resultText}`;
      
      // Update other UI elements
      document.getElementById("compareResult").innerHTML = "";
      this.updateStats(analysis);
      
      // Log for debugging
      if (window.AIDetectorDebug?.config.enabled) {
        window.AIDetectorDebug.logger.info(`Analysis complete: Score ${analysis.aiScore}%`);
      }
    } catch (error) {
      document.getElementById("result").innerHTML = "Error analyzing text: " + error.message;
      if (window.AIDetectorDebug?.config.enabled) {
        window.AIDetectorDebug.logger.error("Error in detectAI function:", error);
      }
    }
  }
  
  clearStats() {
    const statsElements = document.querySelectorAll('.stat-value');
    statsElements.forEach(el => el.textContent = '0');
    
    // Explicitly set word count to 0
    document.getElementById('wordCount').textContent = '0';
  }
  
  updateStats(analysis) {
    // Update word count
    document.getElementById('wordCount').textContent = analysis.wordCount.toString();
    
    // Update sentence count
    document.getElementById('sentenceCount').textContent = analysis.sentenceCount.toString();
    
    // Update readability if available
    if (analysis.metrics?.readabilityScore) {
      document.getElementById('readability').textContent = analysis.metrics.readabilityScore.toString();
    }
  }
  
  setupEventListeners() {
    if (typeof document === 'undefined') return;
    
    // Add event listeners for buttons
    document.getElementById('analyzeBtn').addEventListener('click', () => this.detectAI());
    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('inputText').value = '';
      document.getElementById('result').innerHTML = '';
      document.getElementById('compareResult').innerHTML = '';
      this.clearStats();
    });
    
    // Add theme toggle listener
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    
    // Add language selector listener
    document.getElementById('langSelect').addEventListener('change', (e) => this.switchLang(e.target.value));
  }
  
  addThemeToggle() {
    if (typeof document === 'undefined') return;
    
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.setAttribute('role', 'button');
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    this.updateThemeToggleText();
  }
  
  loadThemePreference() {
    if (typeof localStorage === 'undefined' || typeof document === 'undefined') return;
    
    const savedTheme = localStorage.getItem('aiDetectorTheme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
      this.updateThemeToggleText();
    }
  }
  
  addAccessibilityFeatures() {
    if (typeof document === 'undefined') return;
    
    // Add ARIA labels
    document.getElementById('inputText').setAttribute('aria-label', 'Text to analyze');
    document.getElementById('analyzeBtn').setAttribute('aria-label', 'Analyze text');
    document.getElementById('clearBtn').setAttribute('aria-label', 'Clear text');
    document.getElementById('langSelect').setAttribute('aria-label', 'Select language');
  }
  
  showOfflineMessage() {
    if (typeof document === 'undefined') return;
    
    const offlineMessage = document.createElement('div');
    offlineMessage.className = 'offline-message';
    offlineMessage.textContent = this.translations[this.currentLang].offline;
    document.body.appendChild(offlineMessage);
  }
  
  showOnlineMessage() {
    if (typeof document === 'undefined') return;
    
    const onlineMessage = document.createElement('div');
    onlineMessage.className = 'online-message';
    onlineMessage.textContent = this.translations[this.currentLang].online;
    document.body.appendChild(onlineMessage);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
      onlineMessage.remove();
    }, 3000);
  }
}

// Export for browser environments
if (typeof window !== 'undefined') {
  window.UIController = UIController;
}

/**
 * Update tips section with translated content
 * @param {Object} t - Translation object
 */
function updateTips(t) {
  document.querySelector(".tips-container").innerHTML = `
    <div class="tip-item"><span class="icon"><i class="fas fa-check"></i></span><h4>${t.tipsText.match(/<li><strong>([^<]+)<\/strong>/g)[0].replace('<li><strong>', '').replace('</strong>', '')}</h4><p>${t.tipsText.match(/<li><strong>[^<]+<\/strong>: (.*?)<\/li>/)[1]}</p></div>
    <div class="tip-item"><span class="icon"><i class="fas fa-check"></i></span><h4>${t.tipsText.match(/<li><strong>([^<]+)<\/strong>/g)[1].replace('<li><strong>', '').replace('</strong>', '')}</h4><p>${t.tipsText.match(/<li><strong>[^<]+<\/strong>: (.*?)<\/li>/)[2]}</p></div>
    <div class="tip-item"><span class="icon"><i class="fas fa-check"></i></span><h4>${t.tipsText.match(/<li><strong>([^<]+)<\/strong>/g)[2].replace('<li><strong>', '').replace('</strong>', '')}</h4><p>${t.tipsText.match(/<li><strong>[^<]+<\/strong>: (.*?)<\/li>/)[3]}</p></div>
  `;
}

/**
 * Add theme toggle button to the page
 */
function addThemeToggle() {
  const themeToggle = document.createElement('button');
  themeToggle.id = 'themeToggle';
  themeToggle.className = 'theme-toggle';
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  themeToggle.setAttribute('aria-label', 'Toggle dark mode');
  document.body.appendChild(themeToggle);
  
  themeToggle.addEventListener('click', toggleTheme);
}

/**
 * Update theme toggle button text based on current theme
 */
function updateThemeToggleText() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  
  const isDarkMode = document.documentElement.classList.contains('dark-theme');
  themeToggle.innerHTML = isDarkMode ? 
    '<i class="fas fa-sun"></i>' : 
    '<i class="fas fa-moon"></i>';
  
  themeToggle.setAttribute('aria-label', isDarkMode ? 
    translations[currentLang].lightMode : 
    translations[currentLang].darkMode);
}

/**
 * Load saved theme preference from localStorage
 */
function loadThemePreference() {
  const savedTheme = localStorage.getItem('aiDetectorTheme');
  const savedLang = localStorage.getItem('aiDetectorLang');
  
  // Apply saved theme if it exists
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
    updateThemeToggleText();
  }
  
  // Apply saved language if it exists
  if (savedLang && translations[savedLang]) {
    document.getElementById('langSelect').value = savedLang;
    switchLang(savedLang);
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  // Language selector
  document.getElementById('langSelect').addEventListener('change', function() {
    switchLang(this.value);
  });
  
  // Analyze button
  document.getElementById('analyzeBtn').addEventListener('click', detectAI);
  
  // Compare button
  document.getElementById('compareBtn').addEventListener('click', compareTexts);
  
  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportResults);
  
  // Share button
  document.getElementById('shareBtn').addEventListener('click', shareOnX);
  
  // Clear button
  document.getElementById('clearBtn').addEventListener('click', clearText);
  
  // Educators button
  document.getElementById('educatorsBtn').addEventListener('click', function() {
    window.location.href = 'educators.html';
  });
}

/**
 * Add accessibility features to the page
 */
function addAccessibilityFeatures() {
  // Add skip to content link
  const skipLink = document.createElement('a');
  skipLink.href = '#inputText';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to content';
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Add ARIA labels
  document.getElementById('inputText').setAttribute('aria-label', 'Text to analyze');
  document.getElementById('compareText').setAttribute('aria-label', 'Second text to compare');
  document.getElementById('langSelect').setAttribute('aria-label', 'Select language');
}

/**
 * Compare two texts for AI probability
 */
function compareTexts() {
  const text1 = document.getElementById("inputText").value.trim();
  const text2 = document.getElementById("compareText").value.trim();
  
  if (!text1 || !text2) {
    document.getElementById("compareResult").innerHTML = translations[currentLang].noText;
    return;
  }
  
  try {
    // Use the AIDetector module to compare texts
    const comparison = window.AIDetector.compareTexts(text1, text2);
    
    // Display result immediately without animation for debugging
    const compareResultElement = document.getElementById("compareResult");
    compareResultElement.innerHTML = translations[currentLang].compareResult
      .replace("{score1}", comparison.text1Score)
      .replace("{score2}", comparison.text2Score);
    
    // Update stats
    updateStats(text1);
    
    // Log for debugging
    if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
      window.AIDetectorDebug.logger.info(`Comparison complete: Text1 ${comparison.text1Score}%, Text2 ${comparison.text2Score}%`);
    }
  } catch (error) {
    // Handle errors
    document.getElementById("compareResult").innerHTML = "Error comparing texts: " + error.message;
    if (window.AIDetectorDebug && window.AIDetectorDebug.config.enabled) {
      window.AIDetectorDebug.logger.error("Error in compareTexts function:", error);
    }
  }
}

/**
 * Export analysis results
 */
function exportResults() {
  const text1 = document.getElementById("inputText").value.trim();
  const text2 = document.getElementById("compareText").value.trim();
  let content = "";
  
  if (text1) {
    const score1 = window.AIDetector.analyzeText(text1);
    content += `${translations[currentLang].aiLabel} Text 1: ${score1}%\n`;
    
    // Add text statistics
    const words = text1.split(/\s+/).filter(w => w.length > 0);
    const sentences = text1.split(/[.!?]+/).filter(s => s.trim().length > 0);
    content += `${translations[currentLang].wordCount.replace("{count}", words.length)}\n`;
    content += `${translations[currentLang].sentenceCount.replace("{count}", sentences.length)}\n`;
    
    // Add readability
    const readabilityScore = window.AIDetector.calculateReadability(text1);
    content += `${translations[currentLang].readability.replace("{score}", readabilityScore)}\n\n`;
  }
  
  if (text2) {
    const score2 = window.AIDetector.analyzeText(text2);
    content += `${translations[currentLang].aiLabel} Text 2: ${score2}%\n`;
    
    // Add text statistics
    const words = text2.split(/\s+/).filter(w => w.length > 0);
    const sentences = text2.split(/[.!?]+/).filter(s => s.trim().length > 0);
    content += `${translations[currentLang].wordCount.replace("{count}", words.length)}\n`;
    content += `${translations[currentLang].sentenceCount.replace("{count}", sentences.length)}\n`;
    
    // Add readability
    const readabilityScore = window.AIDetector.calculateReadability(text2);
    content += `${translations[currentLang].readability.replace("{score}", readabilityScore)}\n`;
  }
  
  if (!content) {
    alert(translations[currentLang].noText);
    return;
  }
  
  // Create and download file
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ai_detector_results.txt";
  link.click();
}

/**
 * Share on Twitter/X
 */
function shareOnX() {
  const url = "https://aeell.github.io/ai-text-detector/";
  const text = encodeURIComponent(`Check out this free AI Homework Detector with word counter and more! ${url} #Education #AI`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
}

/**
 * Clear all text inputs and results
 */
function clearText() {
  document.getElementById("inputText").value = "";
  document.getElementById("compareText").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("compareResult").innerHTML = "";
  clearStats();
}

/**
 * Update text statistics display
 * @param {string} text - Text to analyze
 */
function updateStats(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = words.length;
  const sentenceCount = sentences.length;

  // Word Count
  document.getElementById("wordCount").innerHTML = translations[currentLang].wordCount.replace("{count}", wordCount);

  // Repeating Words
  const repeatingWords = window.AIDetector.findRepeatingWords(text, 3);
  const repeats = repeatingWords.map(([word, count]) => `${word} (${count})`).join(", ");
  document.getElementById("repeatWords").innerHTML = translations[currentLang].repeatWords.replace("{list}", repeats || "None");

  // Sentence Count
  document.getElementById("sentenceCount").innerHTML = translations[currentLang].sentenceCount.replace("{count}", sentenceCount);

  // Readability (Flesch Reading Ease)
  const fleschScore = window.AIDetector.calculateReadability(text);
  document.getElementById("readability").innerHTML = translations[currentLang].readability.replace("{score}", fleschScore);
}

/**
 * Clear statistics display
 */
function clearStats() {
  document.getElementById("wordCount").innerHTML = "";
  document.getElementById("repeatWords").innerHTML = "";
  document.getElementById("sentenceCount").innerHTML = "";
  document.getElementById("readability").innerHTML = "";
}
