/**
 * PromptCraft - Main Application Controller
 * Upgraded with Favorites Drawer, JSON Blueprint Export & PWA Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const searchInput = document.getElementById('searchInput');
  const micBtn = document.getElementById('micBtn');
  const clearBtn = document.getElementById('clearBtn');
  const generateBtn = document.getElementById('generateBtn');
  const targetAiSelect = document.getElementById('targetAiSelect');
  const themeToggle = document.getElementById('themeToggle');
  const categoryPills = document.querySelectorAll('.category-pill');
  const modifierPills = document.querySelectorAll('.modifier-pill');
  const cardsContainer = document.getElementById('cardsContainer');
  const emptyState = document.getElementById('emptyState');
  const detectedDomainTag = document.getElementById('detectedDomainTag');
  const toastContainer = document.getElementById('toastContainer');
  
  // Favorites & PWA Elements
  const openFavoritesBtn = document.getElementById('openFavoritesBtn');
  const closeFavoritesBtn = document.getElementById('closeFavoritesBtn');
  const favoritesModal = document.getElementById('favoritesModal');
  const savedPromptsList = document.getElementById('savedPromptsList');
  const savedCountBadge = document.getElementById('savedCountBadge');
  const installAppBtn = document.getElementById('installAppBtn');

  // AI Turbo & Gemini API Settings Elements
  const turboToggleBtn = document.getElementById('turboToggleBtn');
  const turboStatusText = document.getElementById('turboStatusText');
  const geminiKeyBtn = document.getElementById('geminiKeyBtn');
  const apiKeyModal = document.getElementById('apiKeyModal');
  const closeApiKeyBtn = document.getElementById('closeApiKeyBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const geminiModelSelect = document.getElementById('geminiModelSelect');
  const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
  const clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');

  // Legal Modal Elements
  const legalModal = document.getElementById('legalModal');
  const openLegalBtn = document.getElementById('openLegalBtn');
  const closeLegalBtn = document.getElementById('closeLegalBtn');
  const acceptLegalBtn = document.getElementById('acceptLegalBtn');

  // State
  let activeModifiers = [];
  let currentPrompts = null;
  let debounceTimer = null;
  let deferredInstallPrompt = null;
  let isTurboMode = localStorage.getItem('promptcraft_turbo_mode') === 'true';
  let geminiApiKey = localStorage.getItem('promptcraft_gemini_key') || '';
  let selectedGeminiModel = localStorage.getItem('promptcraft_gemini_model') || 'gemini-3.8-flash';

  // Initialize Turbo UI
  updateTurboUI();

  function updateTurboUI() {
    if (isTurboMode && geminiApiKey) {
      turboToggleBtn.classList.add('active');
      turboStatusText.textContent = 'AI Turbo: ON (Gemini 3.8)';
      turboToggleBtn.title = 'AI Turbo Mode active (calls Gemini 3.8 Flash in real-time)';
    } else {
      turboToggleBtn.classList.remove('active');
      turboStatusText.textContent = 'AI Turbo: OFF';
      turboToggleBtn.title = 'Local Engine active (Click to enable Gemini 3.8 Flash)';
    }
  }

  turboToggleBtn.addEventListener('click', () => {
    if (!isTurboMode) {
      if (!geminiApiKey) {
        openApiKeyModal();
        return;
      }
      isTurboMode = true;
      localStorage.setItem('promptcraft_turbo_mode', 'true');
      updateTurboUI();
      showToast('⚡ AI Turbo Mode Activated (Gemini 3.8 Flash)');
      triggerGeneration();
    } else {
      isTurboMode = false;
      localStorage.setItem('promptcraft_turbo_mode', 'false');
      updateTurboUI();
      showToast('Switched to Local Heuristic Engine (Instant)');
      triggerGeneration();
    }
  });

  geminiKeyBtn.addEventListener('click', openApiKeyModal);
  closeApiKeyBtn.addEventListener('click', closeApiKeyModal);

  apiKeyModal.addEventListener('click', (e) => {
    if (e.target === apiKeyModal) closeApiKeyModal();
  });

  function openApiKeyModal() {
    apiKeyInput.value = geminiApiKey;
    if (geminiModelSelect) geminiModelSelect.value = selectedGeminiModel;
    apiKeyModal.classList.add('open');
    setTimeout(() => apiKeyInput.focus(), 100);
  }

  function closeApiKeyModal() {
    apiKeyModal.classList.remove('open');
  }

  toggleKeyVisibility.addEventListener('click', () => {
    const isPass = apiKeyInput.type === 'password';
    apiKeyInput.type = isPass ? 'text' : 'password';
    toggleKeyVisibility.textContent = isPass ? '🔒' : '👁️';
  });

  saveApiKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showToast('⚠️ Please enter an API key, or click Remove Key.');
      return;
    }
    geminiApiKey = key;
    localStorage.setItem('promptcraft_gemini_key', key);
    if (geminiModelSelect) {
      selectedGeminiModel = geminiModelSelect.value;
      localStorage.setItem('promptcraft_gemini_model', selectedGeminiModel);
    }
    isTurboMode = true;
    localStorage.setItem('promptcraft_turbo_mode', 'true');
    updateTurboUI();
    closeApiKeyModal();
    showToast('🔑 Gemini API Key & Model saved! AI Turbo Mode enabled.');
    triggerGeneration();
  });

  clearApiKeyBtn.addEventListener('click', () => {
    geminiApiKey = '';
    localStorage.removeItem('promptcraft_gemini_key');
    isTurboMode = false;
    localStorage.setItem('promptcraft_turbo_mode', 'false');
    apiKeyInput.value = '';
    updateTurboUI();
    closeApiKeyModal();
    showToast('Gemini API key removed. Using Local Engine.');
    triggerGeneration();
  });

  // Legal Modal Handlers
  if (openLegalBtn) {
    openLegalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      legalModal.classList.add('open');
    });
  }

  function closeLegalModal() {
    legalModal.classList.remove('open');
  }

  if (closeLegalBtn) closeLegalBtn.addEventListener('click', closeLegalModal);
  if (acceptLegalBtn) closeLegalModal && acceptLegalBtn.addEventListener('click', closeLegalModal);

  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) closeLegalModal();
  });

  // Initialize PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.log('ServiceWorker registration skipped:', err);
    });
  }

  // Handle PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    installAppBtn.style.display = 'inline-flex';
  });

  installAppBtn.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('🎉 PromptCraft installed to home screen!');
      }
      deferredInstallPrompt = null;
      installAppBtn.style.display = 'none';
    }
  });

  // Initialize Theme
  const savedTheme = localStorage.getItem('promptcraft_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const nextTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('promptcraft_theme', nextTheme);
    updateThemeIcon(nextTheme);
  });

  function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    themeToggle.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  }

  // Favorites Management
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('promptcraft_favorites')) || [];
    } catch {
      return [];
    }
  }

  function saveFavorites(favs) {
    localStorage.setItem('promptcraft_favorites', JSON.stringify(favs));
    updateFavoritesBadge();
  }

  function updateFavoritesBadge() {
    const favs = getFavorites();
    savedCountBadge.textContent = favs.length;
  }

  function toggleFavorite(cardData, rawInput, category) {
    const favs = getFavorites();
    const existingIndex = favs.findIndex(f => f.content === cardData.content);

    if (existingIndex > -1) {
      favs.splice(existingIndex, 1);
      saveFavorites(favs);
      showToast('Removed from Saved Prompts');
      return false;
    } else {
      favs.unshift({
        id: Date.now().toString(),
        title: cardData.title,
        content: cardData.content,
        category: category,
        rawInput: rawInput,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      saveFavorites(favs);
      showToast('⭐ Saved to your library!');
      return true;
    }
  }

  openFavoritesBtn.addEventListener('click', () => {
    renderFavoritesDrawer();
    favoritesModal.classList.add('open');
  });

  closeFavoritesBtn.addEventListener('click', () => {
    favoritesModal.classList.remove('open');
  });

  favoritesModal.addEventListener('click', (e) => {
    if (e.target === favoritesModal) {
      favoritesModal.classList.remove('open');
    }
  });

  function renderFavoritesDrawer() {
    const favs = getFavorites();
    savedPromptsList.innerHTML = '';

    if (favs.length === 0) {
      savedPromptsList.innerHTML = `
        <div style="text-align: center; padding: 40px 10px; color: var(--text-dim);">
          <div style="font-size: 36px; margin-bottom: 8px;">⭐</div>
          <p>No saved prompts yet.</p>
          <p style="font-size: 12px; margin-top: 4px;">Click the star icon on any card to save it for quick access.</p>
        </div>
      `;
      return;
    }

    favs.forEach(fav => {
      const itemEl = document.createElement('div');
      itemEl.className = 'saved-item-card';

      const geminiUrl = PromptEngine.createLaunchUrl('gemini', fav.content);
      const chatGptUrl = PromptEngine.createLaunchUrl('chatgpt', fav.content);

      itemEl.innerHTML = `
        <div class="saved-item-meta">
          <span class="saved-category-tag">${escapeHtml(fav.category || 'General')} • ${escapeHtml(fav.title)}</span>
          <span class="saved-date">${fav.date}</span>
        </div>
        <div class="saved-snippet">${escapeHtml(fav.content)}</div>
        <div class="saved-actions">
          <div style="display: flex; gap: 6px;">
            <button class="btn-copy btn-drawer-copy" data-text="${escapeHtml(fav.content)}" style="padding: 4px 10px; font-size: 11px;">
              📋 Copy
            </button>
            <a href="${geminiUrl}" target="_blank" class="launcher-btn drawer-launcher" data-ai="Gemini" data-text="${escapeHtml(fav.content)}" style="padding: 4px 8px; font-size: 11px;">
              ✨ Gemini
            </a>
            <a href="${chatGptUrl}" target="_blank" class="launcher-btn drawer-launcher" data-ai="ChatGPT" data-text="${escapeHtml(fav.content)}" style="padding: 4px 8px; font-size: 11px;">
              💬 ChatGPT
            </a>
          </div>
          <button class="btn-saved-delete" data-id="${fav.id}">Delete</button>
        </div>
      `;

      savedPromptsList.appendChild(itemEl);
    });

    // Drawer action handlers
    savedPromptsList.querySelectorAll('.btn-drawer-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        copyToClipboard(text, btn);
      });
    });

    savedPromptsList.querySelectorAll('.drawer-launcher').forEach(launcher => {
      launcher.addEventListener('click', () => {
        const aiName = launcher.getAttribute('data-ai') || 'AI';
        const text = launcher.getAttribute('data-text');
        if (text) {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
          } else {
            fallbackCopy(text);
          }
          if (aiName === 'ChatGPT') {
            showToast('💬 Opening ChatGPT (Auto-pasting & copied to clipboard!)');
          } else {
            showToast(`🚀 Opening ${aiName} (Prompt auto-copied! Press Ctrl+V / Paste)`);
          }
        }
      });
    });

    savedPromptsList.querySelectorAll('.btn-saved-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        let favs = getFavorites();
        favs = favs.filter(f => f.id !== id);
        saveFavorites(favs);
        renderFavoritesDrawer();
        triggerGeneration(); // refresh star states on visible cards
      });
    });
  }

  // Pre-seed sample fragments for easy clicking
  const PRESETS = {
    food: "cook, recipe, food, local malay chinese india food",
    weather: "weather, how, here, forecast, today",
    car: "car, type, color, fuel type, hybrid vs ev, maintenance",
    content: "youtube, tiktok, hook, viral script, retaining viewers 3 seconds",
    productivity: "routine, focus, schedule, time blocking, burnout prevention",
    learning: "explain, quantum computing, feynman technique, simple analogy",
    career: "email, follow up, client, polite, project quotation deadline",
    tech: "code, python, api, fast rest server, clean architecture",
    travel: "travel, 4 days itinerary, penang food street, hidden gems"
  };

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const categoryKey = pill.getAttribute('data-preset');
      if (PRESETS[categoryKey]) {
        searchInput.value = PRESETS[categoryKey];
        triggerGeneration(true);
      }
    });
  });

  // Modifiers
  modifierPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const modifier = pill.getAttribute('data-modifier');
      pill.classList.toggle('active');
      if (pill.classList.contains('active')) {
        activeModifiers.push(modifier);
      } else {
        activeModifiers = activeModifiers.filter(m => m !== modifier);
      }
      triggerGeneration(true);
    });
  });

  // Typing event with debounce (Uses instant local engine to protect Gemini Free Tier quota!)
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerGeneration(false);
    }, 280);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      triggerGeneration(true);
    }
  });

  // Web Speech API for Voice Narration Input
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('listening');
      micBtn.title = 'Listening... click to stop';
      showToast('🎙️ Listening... speak your prompt idea!');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      searchInput.value = transcript;
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      isListening = false;
      micBtn.classList.remove('listening');
      micBtn.title = 'Voice Dictation: Speak your prompt ideas';
      if (event.error === 'not-allowed') {
        showToast('⚠️ Microphone access was denied. Please allow microphone permissions.');
      } else if (event.error !== 'no-speech') {
        showToast(`⚠️ Voice input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      isListening = false;
      micBtn.classList.remove('listening');
      micBtn.title = 'Voice Dictation: Speak your prompt ideas';
      if (searchInput.value.trim()) {
        showToast('✨ Voice captured! Synthesizing prompts...');
        triggerGeneration(true);
      }
    };

    micBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (err) {
          console.warn('Recognition start error:', err);
        }
      }
    });
  } else {
    micBtn.addEventListener('click', () => {
      showToast('ℹ️ Voice dictation is not supported in this browser. Try Chrome, Edge, or Safari.');
    });
    micBtn.title = 'Voice dictation not supported in this browser';
  }

  generateBtn.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    triggerGeneration(true);
  });

  clearBtn.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    searchInput.value = '';
    activeModifiers = [];
    modifierPills.forEach(p => p.classList.remove('active'));
    cardsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    detectedDomainTag.style.display = 'none';
    currentPrompts = null;
    searchInput.focus();
    showToast('✨ Cleared! Ready for your next idea.');
  });

  targetAiSelect.addEventListener('change', () => {
    triggerGeneration(true);
  });

  // Track 429 quota cooldown to avoid repeated rate-limit hits
  let turboCooldownUntil = 0;

  async function triggerGeneration(isExplicitTrigger = false) {
    const rawText = searchInput.value.trim();
    if (!rawText) {
      cardsContainer.style.display = 'none';
      emptyState.style.display = 'block';
      detectedDomainTag.style.display = 'none';
      return;
    }

    const targetAI = targetAiSelect.value;

    // AI Turbo Mode (Live Gemini Flash API with Multi-Model Fallback)
    // Only fires on explicit trigger (Enter, ⚡ Synthesize, Voice, Pills) to strictly preserve Free Tier 5 RPM quota
    if (isTurboMode && geminiApiKey && isExplicitTrigger) {
      const now = Date.now();
      if (now < turboCooldownUntil) {
        const remainingSec = Math.ceil((turboCooldownUntil - now) / 1000);
        showToast(`⏳ Gemini Free Tier rate-limit cooldown (~${remainingSec}s left). Using instant Local Engine.`);
      } else {
        cardsContainer.style.display = 'grid';
        emptyState.style.display = 'none';
        cardsContainer.innerHTML = `
          <div class="loading-skeleton">
            <div class="spinner"></div>
            <h4 style="color: #c7d2fe; font-size: 16px;">⚡ Synthesizing via ${selectedGeminiModel || 'Gemini 3.8 Flash'}...</h4>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 400px;">
              Calling Google AI Studio to craft real-time prompts tailored for <strong>${targetAI.toUpperCase()}</strong>...
            </p>
          </div>
        `;
        detectedDomainTag.textContent = `⚡ AI Turbo Active (${selectedGeminiModel || 'Gemini 3.8 Flash'})`;
        detectedDomainTag.style.display = 'inline-block';

        try {
          const aiResult = await PromptEngine.generateWithGemini(rawText, activeModifiers, targetAI, geminiApiKey, selectedGeminiModel);
          currentPrompts = aiResult;
          renderPrompts(aiResult, targetAI, rawText);
          detectedDomainTag.textContent = `✨ ${aiResult.modelUsed || 'Gemini 3.8'}: ${aiResult.detectedCategory}`;
          return;
        } catch (err) {
          if (err.isRateLimit) {
            turboCooldownUntil = Date.now() + (err.waitSeconds || 40) * 1000;
            showToast(`⏳ Gemini Free Tier limit reached (5 req/min). Please wait ~${err.waitSeconds || 40}s. Using Local Engine.`);
          } else {
            showToast(`⚠️ Gemini API: ${err.message}. Using Local Engine.`);
          }
          console.warn('Gemini API call failed, falling back to local heuristic:', err);
        }
      }
    }

    // Local Heuristic Engine (Instant fallback & live preview while typing)
    const result = PromptEngine.generatePrompts(rawText, activeModifiers, targetAI);
    if (result) {
      currentPrompts = result;
      renderPrompts(result, targetAI, rawText);
      const tagPrefix = (isTurboMode && geminiApiKey && !isExplicitTrigger)
        ? `⚡ Live Local Preview (Hit Enter or ⚡ for Turbo)`
        : `🎯 Detected: ${result.detectedCategory}`;
      detectedDomainTag.textContent = tagPrefix;
      detectedDomainTag.style.display = 'inline-block';
      cardsContainer.style.display = 'grid';
      emptyState.style.display = 'none';
    }
  }

  function renderPrompts(prompts, targetAI, rawInput) {
    cardsContainer.innerHTML = '';
    const favs = getFavorites();

    const cardsData = [
      {
        id: 'direct',
        title: 'Option 1: Quick & Direct',
        tagClass: 'tag-direct',
        tagText: 'High Efficiency',
        icon: '⚡',
        content: prompts.direct
      },
      {
        id: 'masterclass',
        title: 'Option 2: Deep Masterclass',
        tagClass: 'tag-master',
        tagText: 'Persona + Constraints',
        icon: '🎓',
        content: prompts.masterclass
      },
      {
        id: 'matrix',
        title: 'Option 3: Comparative Matrix',
        tagClass: 'tag-matrix',
        tagText: 'Structured Table',
        icon: '📊',
        content: prompts.matrix
      }
    ];

    cardsData.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'prompt-card';
      
      const isFavorited = favs.some(f => f.content === card.content);
      const geminiUrl = PromptEngine.createLaunchUrl('gemini', card.content);
      const chatGptUrl = PromptEngine.createLaunchUrl('chatgpt', card.content);
      const claudeUrl = PromptEngine.createLaunchUrl('claude', card.content);
      const deepSeekUrl = PromptEngine.createLaunchUrl('deepseek', card.content);

      cardEl.innerHTML = `
        <div class="card-header">
          <div class="card-title-group">
            <span class="card-icon">${card.icon}</span>
            <span class="card-title">${card.title}</span>
            ${prompts.isAiGenerated ? `<span style="font-size: 11px; background: rgba(99, 102, 241, 0.25); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 4px; padding: 2px 6px; font-weight: 600;">✨ ${prompts.modelUsed || 'Gemini 3.8 Flash'}</span>` : ''}
          </div>
          <div class="card-header-actions">
            <button class="btn-star ${isFavorited ? 'favorited' : ''}" title="${isFavorited ? 'Remove from Saved' : 'Save to Favorites'}">
              ★
            </button>
            <span class="card-tag ${card.tagClass}">${card.tagText}</span>
          </div>
        </div>
        <div class="prompt-content" id="content-${card.id}">${escapeHtml(card.content)}</div>
        <div class="card-actions">
          <div class="action-buttons-group">
            <button class="btn-copy" data-target="content-${card.id}">
              <span>📋</span> Copy Prompt
            </button>
            <button class="btn-json" data-card-id="${card.id}" title="Copy as Structured JSON (Anti-Hallucination Blueprint)">
              <span>📦</span> Copy JSON
            </button>
          </div>
          <div class="ai-launchers">
            <a href="${geminiUrl}" target="_blank" rel="noopener noreferrer" class="launcher-btn card-launcher" data-ai="Gemini" title="Open in Google Gemini">
              ✨ Gemini
            </a>
            <a href="${chatGptUrl}" target="_blank" rel="noopener noreferrer" class="launcher-btn card-launcher" data-ai="ChatGPT" title="Open in ChatGPT">
              💬 ChatGPT
            </a>
            <a href="${claudeUrl}" target="_blank" rel="noopener noreferrer" class="launcher-btn card-launcher" data-ai="Claude" title="Open in Claude">
              🧠 Claude
            </a>
            <a href="${deepSeekUrl}" target="_blank" rel="noopener noreferrer" class="launcher-btn card-launcher" data-ai="DeepSeek" title="Open in DeepSeek">
              🤖 DeepSeek
            </a>
          </div>
        </div>
        <div class="card-paste-tip">
          <span>📋</span>
          <span>Press <strong>Ctrl+V</strong> (Win) or <strong>Cmd+V</strong> (Mac), or long-press (mobile phone) to paste and hit a.i. Chat box, Enter!</span>
        </div>
      `;

      // Star / Favorite button handler
      const starBtn = cardEl.querySelector('.btn-star');
      starBtn.addEventListener('click', () => {
        const nowFavorited = toggleFavorite(card, rawInput, prompts.detectedCategory);
        if (nowFavorited) {
          starBtn.classList.add('favorited');
          starBtn.title = 'Remove from Saved';
        } else {
          starBtn.classList.remove('favorited');
          starBtn.title = 'Save to Favorites';
        }
      });

      // Copy plain text handler
      const copyBtn = cardEl.querySelector('.btn-copy');
      copyBtn.addEventListener('click', () => {
        const targetId = copyBtn.getAttribute('data-target');
        const textToCopy = document.getElementById(targetId).textContent;
        copyToClipboard(textToCopy, copyBtn);
      });

      // Copy structured JSON handler (from the video's architectural technique!)
      const jsonBtn = cardEl.querySelector('.btn-json');
      jsonBtn.addEventListener('click', () => {
        const jsonString = PromptEngine.convertToStructuredJson(card.id, card.content, prompts.detectedCategory, rawInput);
        copyToClipboard(jsonString, jsonBtn, 'Structured JSON Blueprint copied!');
      });

      // Auto-copy to clipboard when any AI Launcher is clicked
      cardEl.querySelectorAll('.card-launcher').forEach(launcher => {
        launcher.addEventListener('click', () => {
          const aiName = launcher.getAttribute('data-ai') || 'AI';
          const textToCopy = card.content;

          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy);
          } else {
            fallbackCopy(textToCopy, null, '');
          }

          if (aiName === 'ChatGPT') {
            showToast('💬 Opening ChatGPT (Auto-pasting & prompt copied to clipboard!)');
          } else {
            showToast(`🚀 Opening ${aiName} (Prompt auto-copied! Press Ctrl+V / Paste)`);
          }
        });
      });

      cardsContainer.appendChild(cardEl);
    });
  }

  function copyToClipboard(text, btnElement, successMsg = 'Prompt copied to clipboard! Paste into your AI chat.') {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showCopySuccess(btnElement, successMsg);
      }).catch(() => {
        fallbackCopy(text, btnElement, successMsg);
      });
    } else {
      fallbackCopy(text, btnElement, successMsg);
    }
  }

  function fallbackCopy(text, btnElement, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopySuccess(btnElement, successMsg);
    } catch (err) {
      showToast('❌ Copy failed, please manually select the text.');
    }
    document.body.removeChild(textarea);
  }

  function showCopySuccess(btnElement, successMsg) {
    const originalText = btnElement.innerHTML;
    btnElement.classList.add('copied');
    btnElement.innerHTML = '<span>✅</span> Copied!';
    showToast(successMsg);

    setTimeout(() => {
      btnElement.classList.remove('copied');
      btnElement.innerHTML = originalText;
    }, 2000);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🚀</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function escapeHtml(string) {
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial favorites badge update
  updateFavoritesBadge();

  // Open with a clean, clear blank dialog prompt box
  searchInput.value = '';
  cardsContainer.style.display = 'none';
  emptyState.style.display = 'block';
  detectedDomainTag.style.display = 'none';
  searchInput.focus();
});
