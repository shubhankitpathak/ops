// src/lib/ai/openrouter.js

/**
 * Extract JSON from potentially markdown-wrapped response
 */
function extractJSON(text) {
  if (!text) return "";

  let cleaned = text.trim();

  // Try to find JSON in markdown code blocks ```...``` or ```json ...```
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Find the first { and last } to isolate JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Analyze build failure logs using OpenRouter AI
 * @param {string} logs - Raw build logs from GitHub Actions
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<Object>} Analysis result
 */ 
export async function analyzeBuildFailure(logs, apiKey) {
  try {
    // Extract relevant error portions (last 3000 chars usually contain the error)
    const relevantLogs = logs.slice(-3000);

    const prompt = `You are an expert DevOps engineer analyzing a failed build deployment. 

Here are the build logs from a GitHub Actions workflow that failed:

\`\`\`
${relevantLogs}
\`\`\`

Please analyze this failure and provide a JSON response with the following structure:

{
  "summary": "Brief 2-3 sentence explanation of what went wrong",
  "category": "dependency|build|configuration|deployment|runtime|other",
  "rootCause": "Specific error message or line that caused the failure",
  "fixes": [
    "Step 1: Specific action with commands if applicable",
    "Step 2: Another specific action",
    "Step 3: Third action"
  ],
  "confidence": "high|medium|low"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation text before or after. Just the raw JSON.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ops.dev",
        "X-Title": "ops Deployment Platform",
      },
      body: JSON.stringify({
        model: "tngtech/deepseek-r1t-chimera:free", // Fast and free model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("🔍 Raw AI response:", content);

    // Extract and parse JSON
    const jsonStr = extractJSON(content);
    console.log("🔍 Extracted JSON:", jsonStr);

    const analysis = JSON.parse(jsonStr);

    // Validate required fields
    if (!analysis.summary || !analysis.category || !analysis.rootCause || !analysis.fixes) {
      throw new Error("Invalid analysis structure");
    }

    return {
      success: true,
      analysis: {
        summary: analysis.summary,
        category: analysis.category,
        rootCause: analysis.rootCause,
        fixes: Array.isArray(analysis.fixes) ? analysis.fixes : [analysis.fixes],
        confidence: analysis.confidence || "medium",
      },
    };
  } catch (error) {
    console.error("AI analysis error:", error);

    return {
      success: false,
      error: error.message,
      analysis: null,
    };
  }
}

/**
 * Get available models from OpenRouter
 */
export async function getAvailableModels(apiKey) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Get models error:", error);
    return [];
  }
}
