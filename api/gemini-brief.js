const AI_MODELS = {
  brief: process.env.GEMINI_FLASH_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash",
  strategy: process.env.GEMINI_PRO_MODEL || "gemini-1.5-pro",
  fingerprint: process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004",
};

function buildFallbackBrief(context = {}) {
  const region = context.region || "the selected region";
  const state = context.state || "watch";
  const event = context.event || "normal operations";
  const route = context.route || "route intelligence unavailable";
  const weather = context.weather || "manual weather index unavailable";

  return {
    source: "fallback",
    model: "local-summary",
    brief: `Local brief: ${region} is in ${state} state during ${event}. Route posture is ${route} and weather conditions read ${weather}.`,
    highlights: [
      `Region score: ${Number(context.score ?? 0)}/100`,
      `Demand pressure: ${Number(context.demand ?? 0)}/100`,
      `Traffic pressure: ${Number(context.traffic ?? 0)}/100`,
    ],
  };
}

function buildFallbackStrategy(context = {}) {
  const region = context.region || "the selected region";
  const score = Number(context.score ?? 0);

  return {
    source: "fallback",
    model: "local-summary",
    brief: `Local strategy: prioritize ${region} with a score of ${score}/100, keep protected lanes open, and reallocate buffer stock before the next cycle.`,
    highlights: [
      `Primary route pressure: ${context.route || "unavailable"}`,
      `Emergency mode: ${context.emergency ? "active" : "inactive"}`,
      `Offline mode: ${context.offline ? "active" : "inactive"}`,
    ],
  };
}

function buildFallbackFingerprint(context = {}) {
  const score = Number(context.score ?? 0);
  const demand = Number(context.demand ?? 0);
  const traffic = Number(context.traffic ?? 0);

  return {
    source: "fallback",
    model: "local-summary",
    vector: [score / 100, demand / 100, traffic / 100],
    summary: `Local fingerprint generated from score ${score}, demand ${demand}, and traffic ${traffic}.`,
  };
}

function formatBriefPrompt(context = {}) {
  return [
    "You are an operations analyst for a supply chain control room.",
    "Write a short, practical dispatch briefing for the current logistics scenario.",
    "Return plain text only with 1 short paragraph and 3 bullet points.",
    `Region: ${context.region || "unknown"}`,
    `Risk score: ${context.score ?? 0}/100`,
    `State: ${context.state || "unknown"}`,
    `Event: ${context.event || "unknown"}`,
    `Weather: ${context.weather || "unknown"}`,
    `Route: ${context.route || "unknown"}`,
    `Demand pressure: ${context.demand ?? 0}/100`,
    `Traffic pressure: ${context.traffic ?? 0}/100`,
    `Emergency mode: ${context.emergency ? "yes" : "no"}`,
    `Offline mode: ${context.offline ? "yes" : "no"}`,
  ].join("\n");
}

function formatStrategyPrompt(context = {}) {
  return [
    "You are a senior logistics strategist for a national supply chain operations center.",
    "Write a concise strategy memo with 1 paragraph and 4 bullet points.",
    "Focus on decision quality, route prioritization, stock posture, and response sequencing.",
    `Region: ${context.region || "unknown"}`,
    `Risk score: ${context.score ?? 0}/100`,
    `Event: ${context.event || "unknown"}`,
    `Route: ${context.route || "unknown"}`,
    `Weather: ${context.weather || "unknown"}`,
    `Demand pressure: ${context.demand ?? 0}/100`,
    `Traffic pressure: ${context.traffic ?? 0}/100`,
    `Emergency mode: ${context.emergency ? "yes" : "no"}`,
    `Offline mode: ${context.offline ? "yes" : "no"}`,
  ].join("\n");
}

function buildEmbeddingText(context = {}) {
  return [
    context.region,
    context.state,
    context.event,
    context.weather,
    context.route,
    `score:${context.score ?? 0}`,
    `demand:${context.demand ?? 0}`,
    `traffic:${context.traffic ?? 0}`,
    `emergency:${context.emergency ? "yes" : "no"}`,
    `offline:${context.offline ? "yes" : "no"}`,
  ].filter(Boolean).join(" | ");
}

function splitHighlights(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

async function callGenerateContent(apiKey, model, prompt, generationConfig = {}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini API request failed (${response.status})`);
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}

async function callEmbedding(apiKey, model, text) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini embedding request failed (${response.status})`);
  }

  const vector = payload.embedding?.values || payload.embedding?.value || [];
  if (!Array.isArray(vector) || !vector.length) {
    throw new Error("Gemini embedding returned no vector");
  }

  return vector;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const context = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const apiKey = process.env.GEMINI_API_KEY;
  const action = String(context.action || "brief");
  const model = AI_MODELS[action] || AI_MODELS.brief;

  if (!apiKey) {
    if (action === "strategy") {
      res.status(200).json(buildFallbackStrategy(context));
      return;
    }

    if (action === "fingerprint") {
      res.status(200).json(buildFallbackFingerprint(context));
      return;
    }

    res.status(200).json(buildFallbackBrief(context));
    return;
  }

  try {
    if (action === "strategy") {
      const text = await callGenerateContent(apiKey, model, formatStrategyPrompt(context), {
        temperature: 0.25,
        maxOutputTokens: 260,
      });

      res.status(200).json({
        source: "gemini",
        action,
        model,
        brief: text,
        highlights: splitHighlights(text),
      });
      return;
    }

    if (action === "fingerprint") {
      const text = buildEmbeddingText(context);
      const vector = await callEmbedding(apiKey, model, text);
      const preview = vector.slice(0, 6).map((value) => Number(value).toFixed(3));

      res.status(200).json({
        source: "gemini",
        action,
        model,
        summary: `Embeddings fingerprint created from ${vector.length} dimensions.`,
        vectorPreview: preview,
        vectorSize: vector.length,
      });
      return;
    }

    const text = await callGenerateContent(apiKey, model, formatBriefPrompt(context), {
      temperature: 0.3,
      maxOutputTokens: 220,
    });

    res.status(200).json({
      source: "gemini",
      action,
      model,
      brief: text,
      highlights: splitHighlights(text),
    });
  } catch (error) {
    if (action === "strategy") {
      res.status(200).json({
        ...buildFallbackStrategy(context),
        error: error.message,
      });
      return;
    }

    if (action === "fingerprint") {
      res.status(200).json({
        ...buildFallbackFingerprint(context),
        error: error.message,
      });
      return;
    }

    res.status(200).json({
      ...buildFallbackBrief(context),
      error: error.message,
    });
  }
};