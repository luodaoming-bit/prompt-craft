# PromptCraft ✨
### Smart Fragment-to-Prompt Synthesizer for AI Chats

**Version:** Free Version v1.0  
**Developer:** DaoMing  
**Framework & Tooling:** Built with Google Antigravity & Google Gemini  

PromptCraft solves **"prompt paralysis"** (the blank AI chat dialogue box). Instead of struggling to write long, structured prompts, you simply type disjointed keywords, fragments, or broken thoughts, and PromptCraft synthesizes **3 production-grade, fine-tuned prompts** ready to copy or launch directly into your AI assistant.

*Inspired by the workflow demonstrated in [Awa K. Penn's AI App Tutorial](https://youtu.be/LLjy46X9rJE).*

---

## 🚀 How to Run

Because PromptCraft is built with zero-dependency vanilla web standards:

### Method 1: Instant Direct Open (No server needed)
* Navigate to `c:\Users\cekol\Desktop\Projects\PromptCraft\`
* Double-click **`index.html`** in your file explorer. It will open in any modern browser (Chrome, Edge, Brave, or Firefox) immediately.

### Method 2: Mobile / Desktop App Installation (PWA)
* Open PromptCraft in your browser.
* On **Desktop (Chrome/Edge):** Click the **"📲 Install App"** button in the top header or the install icon in the address bar to run PromptCraft as a standalone desktop app.
* On **Mobile (Android/iOS):** Tap your browser menu and choose **"Add to Home Screen"** to use it like a native mobile app!

### Method 3: Via Local Web Server
```powershell
cd c:\Users\cekol\Desktop\Projects\PromptCraft
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 💡 What's New (Inspired by the Video)

1. **⭐ Saved Prompts / Favorites Drawer:**
   * Bookmark your favorite generated prompts with a single click on the star (`★`) icon.
   * Access your saved library anytime via the **"Saved"** button in the header.
   * Easily re-copy or launch saved prompts into Gemini or ChatGPT with one click.

2. **📦 "Copy as Structured JSON" Blueprint:**
   * In addition to regular text, click **"📦 Copy JSON"** on any card.
   * Exports an anti-hallucination JSON schema containing `role`, `domain`, `task`, `execution_guidelines`, and `output_format`—the exact prompting technique praised in the video for keeping LLMs on track.

3. **📚 Expanded Quick Idea Categories:**
   * 🍳 *Local Food & Cooking* (Malay, Chinese, Indian Southeast Asian culinary heritage)
   * 🌦️ *Weather & Daily Life*
   * 🚗 *Car & Vehicle Buying*
   * 📱 *Social & Video Content* (Hooks, retention scripts, viral angles)
   * ⚡ *Productivity & Habits* (Time blocking, routines, burnout prevention)
   * 🎯 *Explain & Teach* (Feynman technique, simple analogies)
   * 💼 *Career & Professional Email*
   * 💻 *Coding & Architecture*
   * ✈️ *Travel & Itinerary*

---

## 🌟 Key Features

* **🎙️ Voice Narration / Mic Input:**
  * Click the microphone (`🎙️`) button inside the search box and speak naturally.
  * Your speech is transcribed in real-time and automatically synthesized into master prompts the moment you finish speaking!
* **✨ Clean Blank Start:**
  * Opens fresh and clean every session with an empty prompt box and focused cursor.
* **⚡ AI Turbo Mode (Google Gemini 3.8 Flash):**
  * Toggle between instant local heuristics (< 5ms) and real-time live LLM expansion using Gemini 3.8 Flash (with automatic multi-model fallback).
* **3 Distinct Prompt Flavors:**
  * **⚡ Option 1: Quick & Direct** — Minimal tokens, direct answer prompt.
  * **🎓 Option 2: Deep Masterclass** — Persona assignment, step-by-step guidance, and pitfall prevention.
  * **📊 Option 3: Comparative Matrix** — Structured markdown table with evaluation criteria.
* **One-Click Actions:**
  * **📋 Copy Prompt:** Instant clipboard copy with visual feedback toast.
  * **📦 Copy JSON:** Structured prompt blueprint for advanced models.
  * **✨ Gemini / 💬 ChatGPT / 🧠 Claude / 🤖 DeepSeek:** Direct launcher buttons to jump straight into your preferred AI chat.
* **One-Tap Modifiers:** Toggle `+ Step-by-Step`, `+ For Beginners`, `+ Budget-Conscious`, `+ Malaysian Context`, or `+ Table Format`.
* **Theme Switcher:** Single-click toggle between Dark and Light mode.
* **100% Private & Offline:** Zero external tracking, runs completely inside your browser with local persistence.
