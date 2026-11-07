/**
 * PromptCraft - Core Keyword-to-Prompt Synthesis Engine
 * Upgraded with Multi-Domain Knowledge + Structured JSON Blueprinting
 */

const PromptEngine = (() => {
  // Domain knowledge bases & intent dictionaries
  const DOMAINS = {
    cooking: {
      triggers: ['cook', 'recipe', 'food', 'bake', 'dish', 'ingredient', 'meal', 'dinner', 'lunch', 'breakfast', 'malay', 'chinese', 'indian', 'india', 'curry', 'nasi', 'rendang', 'soup', 'kitchen', 'taste', 'flavor', 'halal', 'vegetarian', 'spicy'],
      defaultPersona: 'Act as a seasoned culinary master and Southeast Asian heritage food expert.',
      categories: ['Culinary & Food'],
      synthesize: (extracted, raw) => {
        const isLocalAsian = extracted.hasLocalAsian || /malay|chinese|india|asian|singapore|mamak|peranakan/i.test(raw);
        const cuisineDetail = isLocalAsian 
          ? "authentic Southeast Asian culinary traditions (celebrating Malay, Chinese, and Indian Malaysian heritage with aromatic rempah, wok hei, or tempering techniques)"
          : (extracted.subject || "home-cooked dishes");

        return {
          direct: `Provide 3 delicious, well-tested recipe options for ${cuisineDetail} based on these preferences: "${raw}". Include an exact ingredient list, prep & cook times, and clear step-by-step cooking directions.`,
          masterclass: `You are an expert culinary instructor. Guide me through preparing an authentic meal featuring ${cuisineDetail}.
Key instructions:
1. Break down the essential aromatics, key spices, and pantry staples needed.
2. Provide step-by-step preparation and cooking instructions, noting critical temperature and sensory cues (e.g. when the oil separates or wok smoke appears).
3. Suggest practical ingredient substitutions for home kitchens and offer pairing recommendations.
4. Highlight common beginner mistakes and how to prevent them.`,
          matrix: `Create a structured recipe comparison guide for ${cuisineDetail} in response to: "${raw}".
Format the response as a markdown table with columns:
| Dish Name | Heritage / Origin | Key Flavors | Difficulty (1-5) | Est. Cooking Time | Must-Have Spices |
Follow up the table with a short breakdown of the top recommended dish to start with and a concise grocery shopping list.`
        };
      }
    },

    weather: {
      triggers: ['weather', 'forecast', 'rain', 'temperature', 'climate', 'sunny', 'humidity', 'storm', 'monsoon', 'haze', 'umbrella', 'how here', 'here weather'],
      defaultPersona: 'Act as a local meteorological and outdoor planning consultant.',
      categories: ['Daily Life & Weather'],
      synthesize: (extracted, raw) => {
        const locationPrompt = extracted.location ? extracted.location : "[Current Location / City]";
        return {
          direct: `What is the current weather forecast and today's outlook for ${locationPrompt}? Please provide expected high/low temperatures, chance of rain or thunderstorms, humidity level, and practical advice on whether to bring an umbrella.`,
          masterclass: `Act as a local meteorologist. Provide a detailed weather breakdown and situational outlook for ${locationPrompt} based on today's conditions ("${raw}").
Include:
1. Hourly weather progression (morning, afternoon peak heat, evening, night).
2. Rain and precipitation probability, UV index, and air quality index (AQI) guidance.
3. Specific recommendations for commuting, outdoor exercise, and appropriate clothing choices.
4. Any adverse weather alerts or seasonal weather advisories to watch out for.`,
          matrix: `Provide an organized weather planning matrix for ${locationPrompt}.
Format the output as a timeline comparison:
| Time Window | Expected Conditions | Temp / Feels Like | Rain Chance % | Outdoor Suitability & Tips |
Conclude with a brief summary bullet list of essentials to carry today.`
        };
      }
    },

    automotive: {
      triggers: ['car', 'vehicle', 'suv', 'sedan', 'fuel', 'hybrid', 'ev', 'electric', 'diesel', 'petrol', 'mileage', 'color', 'specs', 'budget', 'engine', 'maintenance', 'resale', 'road tax'],
      defaultPersona: 'Act as an independent, objective automotive advisor and vehicle reliability specialist.',
      categories: ['Automotive & Buying'],
      synthesize: (extracted, raw) => {
        const focus = extracted.subject || "vehicles matching criteria: " + raw;
        return {
          direct: `I am researching options to buy a vehicle based on these criteria: "${raw}". Suggest the top 3 recommended models currently on the market, noting their estimated price range, fuel economy/range, and key strengths.`,
          masterclass: `Act as a veteran automotive inspector and buying consultant. Provide a comprehensive buyer's evaluation for ${focus}.
Please structure your evaluation into:
1. Market Overview: Top contenders that match these specifications.
2. Powertrain & Efficiency: Compare fuel types (e.g. Hybrid vs EV vs Petrol), expected real-world fuel consumption/range, and long-term maintenance implications.
3. Total Cost of Ownership (TCO): Breakdown of annual maintenance, battery/engine longevity, insurance, and projected 5-year depreciation/resale value.
4. Checklist for Inspection: What specific issues, trim quirks, or test-drive red flags to check before deciding.`,
          matrix: `Create an exhaustive side-by-side comparison matrix for vehicles matching: "${raw}".
Format as a detailed markdown table:
| Model & Trim | Powertrain / Fuel | Est. Price | Real-World Fuel Economy | Reliability Rating | Key Pros | Key Cons |
Follow up with a clear "Best Value", "Best Reliability", and "Best Overall" verdict.`
        };
      }
    },

    content_creation: {
      triggers: ['social', 'youtube', 'tiktok', 'instagram', 'reel', 'video', 'post', 'viral', 'script', 'hook', 'caption', 'creator', 'thumbnail', 'podcast', 'views'],
      defaultPersona: 'Act as an elite digital content strategist and viral scriptwriter.',
      categories: ['Content Creation & Social Media'],
      synthesize: (extracted, raw) => {
        return {
          direct: `Write 3 high-converting social media content hooks and a short video script for: "${raw}". Focus on retaining viewer attention in the first 3 seconds with a strong call-to-action (CTA).`,
          masterclass: `Act as a viral content strategist and YouTube/TikTok script doctor. Develop a comprehensive content production package for: "${raw}".
Include:
1. 5 High-CTR Hook Variations (Curiosity gap, Contrarian take, Story-driven, Problem-Agitate-Solve, and Direct Benefit).
2. Full video script outline with visual cues (B-roll, on-screen text, pacing notes).
3. Strategic Thumbnail / Visual Concept breakdown.
4. Platform-optimized captions with relevant hashtags and engagement-prompting comment pins.`,
          matrix: `Create a multi-platform content repurposing matrix for: "${raw}".
Format as a table:
| Platform | Content Format | Target Hook / Angle | Ideal Video Length / Word Count | CTA Strategy |
Follow up with optimal posting frequency and audience retention tips.`
        };
      }
    },

    tech_coding: {
      triggers: ['code', 'python', 'javascript', 'bug', 'error', 'database', 'sql', 'api', 'react', 'css', 'html', 'program', 'function', 'app', 'deploy', 'git', 'script', 'fix'],
      defaultPersona: 'Act as a Senior Principal Software Architect and clean-code specialist.',
      categories: ['Tech & Programming'],
      synthesize: (extracted, raw) => {
        return {
          direct: `Help me solve this technical requirement: "${raw}". Provide clean, minimal, and modern code with brief inline comments explaining the logic, plus instructions on how to run or test it.`,
          masterclass: `Act as a Senior Software Engineer. Architect a robust, production-ready solution for: "${raw}".
Include:
1. High-level architectural approach and choice of best-practice libraries/tools.
2. Complete, idiomatic, and clean code implementation handling common edge cases and error states.
3. Explanation of time & space complexity, security considerations, and performance bottlenecks.
4. Unit testing example or verification steps.`,
          matrix: `Evaluate the best architectural options or libraries to achieve: "${raw}".
Present a comparison table:
| Solution / Approach | Pros | Cons | Performance | Ease of Maintenance | Recommended For |
Conclude with the single strongest implementation recommendation and a quick start snippet.`
        };
      }
    },

    career_writing: {
      triggers: ['email', 'resume', 'cv', 'job', 'interview', 'letter', 'write', 'draft', 'proposal', 'summary', 'formal', 'boss', 'client', 'meeting', 'contract', 'salary'],
      defaultPersona: 'Act as an executive communications coach and professional business consultant.',
      categories: ['Career & Business'],
      synthesize: (extracted, raw) => {
        return {
          direct: `Draft a polished, professional response for: "${raw}". Keep the tone polite, confident, and concise, with clear next steps and no unnecessary jargon.`,
          masterclass: `Act as a C-level executive communications strategist. Craft high-impact messaging based on: "${raw}".
Provide:
1. A strategic framing analysis (the psychological angle, desired outcome, and tone calibration).
2. The primary draft (executive, persuasive, and clear).
3. An alternative version (more assertive or more diplomatic depending on context).
4. Subject line options (if applicable) and tactical advice on timing or follow-up.`,
          matrix: `Analyze different communication strategies for: "${raw}".
Provide a matrix:
| Strategy / Tone | Best When | Potential Risk | Key Phrase Excerpts |
Followed by the recommended full draft ready to send.`
        };
      }
    },

    productivity: {
      triggers: ['habit', 'routine', 'schedule', 'time', 'productivity', 'todo', 'plan', 'focus', 'organize', 'goals', 'pomodoro', 'burnout', 'procrastination'],
      defaultPersona: 'Act as a high-performance productivity coach and time-management strategist.',
      categories: ['Productivity & Planning'],
      synthesize: (extracted, raw) => {
        return {
          direct: `Create a realistic, actionable daily productivity routine and prioritization plan for: "${raw}". Focus on high-leverage tasks, energy management, and minimal friction.`,
          masterclass: `Act as a behavioral psychologist and executive productivity mentor. Design a sustainable operating system for: "${raw}".
Include:
1. Core Audit: Identify the biggest time-drains, decision fatigue traps, and resistance points.
2. The Time-Block Framework: Morning anchor routine, deep work sprints, and shutdown rituals.
3. Friction Reduction: Environmental hacks and digital hygiene rules to prevent distraction.
4. Weekly Review Protocol: A 15-minute reflection checklist to sustain momentum.`,
          matrix: `Break down the best productivity frameworks applicable to: "${raw}".
Present a comparison table:
| Method (e.g. Eisenhower, Time-Boxing, 2-Minute Rule) | Best Used For | Setup Effort | Key Advantage |
Conclude with a custom 7-day starter schedule.`
        };
      }
    },

    learning_explainer: {
      triggers: ['explain', 'learn', 'understand', 'concept', 'feynman', 'simple', 'teach', 'study', 'math', 'science', 'philosophy', 'history', 'beginner', 'summary'],
      defaultPersona: 'Act as a master educator and Feynman-method learning specialist.',
      categories: ['Learning & Explainers'],
      synthesize: (extracted, raw) => {
        const cleanSubject = raw.replace(/^(?:explain|teach me|how does|learn about|what is|tell me about)\s+/i, '').trim() || raw;
        return {
          direct: `Explain the concept of "${cleanSubject}" in simple, intuitive terms as if teaching an enthusiastic beginner. Use clear analogies and avoid excessive jargon.`,
          masterclass: `You are a world-class academic tutor utilizing the Feynman Technique. Deconstruct and explain: "${cleanSubject}".
Follow this sequence:
1. Intuitive Mental Model: A vivid real-world analogy that makes the core idea instantly click.
2. Technical Mechanics: How it actually works under the hood, explained step-by-step with zero fluff.
3. Common Misconceptions: What people frequently misunderstand about this concept.
4. Quick Comprehension Quiz: 3 quick conceptual questions with answers to test understanding.`,
          matrix: `Provide a multi-level conceptual breakdown of: "${cleanSubject}".
Format as a comparison matrix:
| Explanation Level | Target Audience | Core Analogy / Key Takeaway | Detail Depth |
Conclude with a curated list of top recommended books or foundational resources to master the topic.`
        };
      }
    },

    travel_leisure: {
      triggers: ['travel', 'trip', 'itinerary', 'flight', 'hotel', 'vacation', 'visit', 'places', 'tourist', 'island', 'beach', 'mountain', 'backpacking'],
      defaultPersona: 'Act as an expert travel curator and local insider guide.',
      categories: ['Travel & Adventures'],
      synthesize: (extracted, raw) => {
        return {
          direct: `Create a practical travel itinerary and recommendations based on: "${raw}". Include must-visit spots, optimal time to spend at each location, and local food highlights.`,
          masterclass: `Act as an insider travel guide and cultural concierge. Craft a curated travel master plan for: "${raw}".
Include:
1. Day-by-day itinerary optimized for efficient transit and minimal fatigue.
2. Hidden local gems, cultural etiquette tips, and authentic street food spots tourists often miss.
3. Logistics breakdown: Recommended transport apps, seasonal packing tips, and money-saving hacks.
4. Safety, connectivity (eSIM/SIM), and booking lead-time recommendations.`,
          matrix: `Create a structured destination comparison or itinerary breakdown for: "${raw}".
Present as a table:
| Time / Day | Activity / Attraction | Local Food Recommendation | Est. Budget | Insider Tip |
Conclude with a packing checklist and essential local phrases.`
        };
      }
    }
  };

  // Generic fallback synthesizer for arbitrary or unstructured inputs
  function genericSynthesizer(rawInput, modifiers = []) {
    const cleaned = rawInput.trim();
    return {
      direct: `Provide a direct, thorough, and highly practical guide regarding: "${cleaned}". Give actionable advice, key considerations, and concrete examples without unnecessary filler.`,
      masterclass: `Act as a world-class domain expert on the topic of: "${cleaned}".
Please provide a masterclass-level breakdown:
1. Core Principles: Explain the fundamental mechanisms, background context, and key definitions.
2. Step-by-Step Action Plan: Detail how to execute or achieve the goal effectively, from initial steps to advanced execution.
3. Common Mistakes & Edge Cases: What are the frequent missteps beginners make and how can they be avoided?
4. Best-Practice Checklist: Provide an actionable summary checklist to verify success.`,
      matrix: `Conduct an in-depth structured breakdown regarding: "${cleaned}".
Format key elements into a comparison table:
| Factor / Option | Key Details | Major Advantages | Potential Drawbacks | Actionable Advice |
Conclude with a definitive summary recommendation based on practical real-world experience.`
    };
  }

  // Helper to extract keywords and determine best domain match
  function analyzeInput(raw) {
    const lower = (raw || '').toLowerCase();
    const tokens = lower.split(/[\s,;+.\-\/]+/).filter(t => t.length > 1);

    let bestDomain = null;
    let highestScore = 0;

    for (const [key, domain] of Object.entries(DOMAINS)) {
      let score = 0;
      for (const trigger of domain.triggers) {
        if (trigger.includes(' ')) {
          if (lower.includes(trigger)) score += 3;
        } else if (tokens.includes(trigger)) {
          score += 2;
        } else if (lower.includes(trigger)) {
          score += 1;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestDomain = key;
      }
    }

    const hasLocalAsian = /malay|chinese|india|singapore|penang|kl|kuala lumpur|mamak|laksa|rendang|satay/i.test(lower);
    
    // Extract location or subject candidate
    let location = null;
    const locMatch = lower.match(/(?:in|at|for|near|around)\s+([a-zA-Z\s]+?)(?:,|$|\.|\bweather\b|\bforecast\b)/i);
    if (locMatch && locMatch[1].trim().length > 2) {
      location = locMatch[1].trim();
    } else if (lower.includes('here')) {
      location = 'my current local area (use location-based context)';
    }

    return {
      domainKey: highestScore > 0 ? bestDomain : null,
      tokens,
      hasLocalAsian,
      location,
      raw
    };
  }

  /**
   * Main generation function
   */
  function generatePrompts(input, activeModifiers = [], targetAI = 'gemini') {
    if (!input || !input.trim()) {
      return null;
    }

    const analysis = analyzeInput(input);
    let rawPrompts;

    if (analysis.domainKey && DOMAINS[analysis.domainKey]) {
      rawPrompts = DOMAINS[analysis.domainKey].synthesize(analysis, input);
    } else {
      rawPrompts = genericSynthesizer(input, activeModifiers);
    }

    // Apply active modifiers to all 3 prompts
    const modifiedPrompts = {
      direct: applyModifiers(rawPrompts.direct, activeModifiers, 'direct', targetAI),
      masterclass: applyModifiers(rawPrompts.masterclass, activeModifiers, 'masterclass', targetAI),
      matrix: applyModifiers(rawPrompts.matrix, activeModifiers, 'matrix', targetAI),
      detectedCategory: analysis.domainKey ? DOMAINS[analysis.domainKey].categories[0] : 'General Topic',
      tokensAnalyzed: analysis.tokens,
      rawInput: input
    };

    return modifiedPrompts;
  }

  function applyModifiers(promptText, modifiers, type, targetAI) {
    let result = promptText;
    const additions = [];

    if (modifiers.includes('stepByStep') && !result.includes('step-by-step')) {
      additions.push("Please present the core advice in numbered, logical steps that are easy to follow sequentially.");
    }

    if (modifiers.includes('beginner') && !result.includes('beginner')) {
      additions.push("Assume I am a complete beginner: explain any jargon simply and avoid overly technical assumptions.");
    }

    if (modifiers.includes('budget') && !result.includes('cost')) {
      additions.push("Emphasize high value-for-money, cost savings, and budget-friendly alternatives.");
    }

    if (modifiers.includes('localContext') && !/malay|singapore|southeast asian/i.test(result)) {
      additions.push("Please tailor the suggestions with local Southeast Asian (Malaysian / Singaporean) context, ingredients, or market conditions where applicable.");
    }

    if (modifiers.includes('tableFormat') && !result.includes('table')) {
      additions.push("Summarize the most important points or comparisons in a clean markdown table.");
    }

    if (modifiers.includes('pitfalls') && !result.includes('mistakes')) {
      additions.push("Include a section on common pitfalls, warning signs, and mistakes to steer clear of.");
    }

    // Target AI specific flavor tuning
    if (targetAI === 'claude') {
      additions.push("Think deeply, be intellectually nuanced, and provide clear structured reasoning.");
    } else if (targetAI === 'gemini') {
      additions.push("Provide up-to-date real-world insights with clear bullet points and actionable summaries.");
    } else if (targetAI === 'deepseek') {
      additions.push("Use rigorous step-by-step logic and highlight underlying trade-offs.");
    }

    if (additions.length > 0) {
      result += "\n\nAdditional Requirements:\n- " + additions.join("\n- ");
    }

    return result;
  }

  /**
   * Converts a prompt into a structured JSON Schema Blueprint.
   * Highlighted in the video as the optimal format to prevent AI hallucinations!
   */
  function convertToStructuredJson(promptType, promptText, category, rawInput) {
    const personaMap = {
      direct: "Practical Domain Assistant",
      masterclass: "Subject Matter Expert & Senior Consultant",
      matrix: "Comparative Systems Analyst"
    };

    const schema = {
      prompt_blueprint: {
        version: "2.0",
        purpose: "High-precision AI instruction blueprint",
        domain: category || "General Knowledge",
        user_intent: rawInput || "User inquiry",
        system_persona: personaMap[promptType] || "AI Expert",
        task: promptText,
        execution_guidelines: [
          "Follow instructions strictly without off-topic hallucinations.",
          "Provide actionable, concrete explanations and avoid generic filler.",
          "Format headings and tables using clean markdown."
        ],
        output_format: promptType === 'matrix' ? "Markdown Table + Analytical Summary" : "Structured Multi-Section Guide"
      }
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generates direct URLs to launch prompts in the selected AI interface
   */
  function createLaunchUrl(aiTool, promptText) {
    const encoded = encodeURIComponent(promptText);
    switch (aiTool.toLowerCase()) {
      case 'chatgpt':
        return `https://chatgpt.com/?q=${encoded}`;
      case 'gemini':
        return `https://gemini.google.com/app?q=${encoded}`;
      case 'claude':
        return `https://claude.ai/new`;
      case 'deepseek':
        return `https://chat.deepseek.com/`;
      default:
        return `https://gemini.google.com/app?q=${encoded}`;
    }
  }

  /**
   * Calls Google Gemini API directly from the browser (AI Turbo Mode)
   * Uses Gemini 3.8 Flash with automatic multi-model fallback to ensure it never fails!
   */
  async function generateWithGemini(input, activeModifiers = [], targetAI = 'gemini', apiKey = '', selectedModel = 'gemini-3.8-flash') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error("Please enter your Google Gemini API key to use AI Turbo Mode.");
    }

    const modifierText = activeModifiers.length > 0 
      ? `Specific requirements to strictly include: ${activeModifiers.join(', ')}.` 
      : '';

    const systemPrompt = `You are an elite AI prompt engineer.
The user has provided a fragmented, messy, or incomplete thought:
"${input}"

Target AI chat assistant that will receive the final prompt: ${targetAI.toUpperCase()}
${modifierText}

Your task: Synthesize 3 distinct, production-ready, highly effective prompts for the user to copy-paste directly into ${targetAI.toUpperCase()}:
1. "direct": A crisp, fast, high-yield prompt for a quick direct answer.
2. "masterclass": A deep, comprehensive prompt that assigns a specialized persona, includes detailed execution steps, constraints, and edge-case handling.
3. "matrix": A prompt that explicitly asks the target AI to output comparison tables, side-by-side matrices, and decision criteria.

Also identify the primary category in "detectedCategory" (e.g. "Culinary", "Automotive", "Technology", "Content Creation", etc.).

Return ONLY a valid JSON object matching this schema:
{
  "direct": "string",
  "masterclass": "string",
  "matrix": "string",
  "detectedCategory": "string"
}`;

    // Candidate models in priority order: user selection first, followed by reliable fallbacks
    const candidateModels = [
      selectedModel || 'gemini-3.8-flash',
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt }]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${response.status}`;

          // If rate limited / quota exceeded (Free tier has 5 requests/min limit)
          if (response.status === 429 || errMsg.toLowerCase().includes('quota')) {
            const retryMatch = errMsg.match(/retry in ([\d\.]+)s/i);
            const waitSeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 40;
            const rateErr = new Error(`Gemini Free Tier limit (5 req/min) reached. Please wait ~${waitSeconds}s before retrying Turbo Mode.`);
            rateErr.isRateLimit = true;
            rateErr.waitSeconds = waitSeconds;
            throw rateErr;
          }

          // If model is unsupported/not found/deprecated, try the next model candidate
          if (response.status === 404 || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('deprecated') || errMsg.toLowerCase().includes('unsupported')) {
            lastError = new Error(`Model ${modelName}: ${errMsg}`);
            console.warn(`Model ${modelName} returned error: ${errMsg}. Trying next candidate...`);
            continue;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawContent) {
          throw new Error("No response generated by Gemini API.");
        }

        const parsed = JSON.parse(rawContent);
        return {
          direct: parsed.direct,
          masterclass: parsed.masterclass,
          matrix: parsed.matrix,
          detectedCategory: parsed.detectedCategory || "AI-Synthesized",
          tokensAnalyzed: input.split(/[\s,;+.\-\/]+/).filter(t => t.length > 1),
          rawInput: input,
          isAiGenerated: true,
          modelUsed: modelName
        };
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes('404') || err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('deprecated'))) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Failed to connect to Gemini API with available models.");
  }

  return {
    generatePrompts,
    generateWithGemini,
    analyzeInput,
    createLaunchUrl,
    convertToStructuredJson,
    DOMAINS
  };
})();

// Export for node or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptEngine;
}
