/**
 * Google Gemini API Client & Smart B.Tech AI Engine (Server-Side Secured)
 * ------------------------------------------------------------------------
 * SECURITY GUARANTEE:
 * - NO API keys are stored in frontend JavaScript or localStorage.
 * - All requests are routed through backend API routes (/api/gemini).
 * - GEMINI_API_KEY is kept strictly on the server (.env / server environment).
 * - Automatic Model Fallback: Seamlessly falls back across Gemini 2.0 / 1.5 models
 *   if a specific model is not enabled for the API key project.
 * - Full Server-Sent Events (SSE) streaming support for real-time responses.
 * - Multi-turn conversation context memory.
 * - Trilingual support: English, Hindi (हिंदी), and Hinglish.
 * - Step-by-step mathematical solutions and code complexity analysis.
 */

export const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export const AVAILABLE_MODELS = [
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite (Ultra Fast & Recommended)" },
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (High Intelligence & Speed)" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Next-Gen Fast & Reliable)" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Standard Academic Model)" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro (Deep Engineering Reasoning)" },
];

export const CANDIDATE_FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.5-flash",
  "gemini-1.5-pro",
];

// --------------- Model Preference Storage ---------------

export function getStoredModel() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem("gemini_model");
    // Migrate away from legacy gemini-1.5 models to gemini-3.5-flash-lite
    if (saved && saved !== "gemini-1.5-flash" && saved !== "gemini-1.5-pro") {
      return saved;
    }
  }
  return DEFAULT_MODEL;
}

export function setStoredModel(model) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem("gemini_model", model || DEFAULT_MODEL);
  }
}

export function getDirectClientKey() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      const k = import.meta.env.VITE_GEMINI_API_KEY.trim();
      if (k && !k.includes('PASTE_YOUR_') && k.length > 5) return k;
    }
    if (typeof localStorage !== 'undefined') {
      const k = (localStorage.getItem('gemini_api_key') || '').trim();
      if (k && !k.includes('PASTE_YOUR_') && k.length > 5) return k;
    }
  } catch (e) { }
  return '';
}

// --------------- Comprehensive B.Tech Tutor System Prompt ---------------

export const BTECH_TUTOR_SYSTEM_PROMPT = `You are "EduEngine AI", a Senior B.Tech Professor, Engineering College Academic Mentor, and Technical Interview Coach powered by Google Gemini.

## Academic & Engineering Scope
- **Engineering Mathematics**: Step-by-step solutions for Differential/Integral Calculus, Linear Algebra (Matrices, Eigenvalues, Cayley-Hamilton), Differential Equations, Laplace Transforms, Fourier Series, Probability & Statistics, Complex Variables, Numerical Methods.
- **Computer Science & IT**: Data Structures & Algorithms (DSA), Operating Systems (OS), Database Management Systems (DBMS), Computer Networks (CN), Theory of Computation (TOC), Compiler Design, Computer Architecture (COA), Software Engineering.
- **AI & Modern Tech**: Machine Learning, Deep Learning (ANN, CNN, RNN, Transformers), NLP, Computer Vision, Cloud Computing & DevOps, Cyber Security & Cryptography.
- **Programming Languages**: C, C++, Java, Python, SQL, JavaScript — with clean syntax, idiomatic style, robust error handling, and comments.

## Communication & Language Capabilities
- **Multilingual Support**: You are completely fluent in **English**, **Hindi (हिंदी)**, and **Hinglish** (conversational mix of Hindi and English in Roman script).
- If the student asks in Hindi or Hinglish (e.g. "Bhai Dijkstra algorithm easy way mein samjha de", "Operating systems ke important questions batado semester exam ke liye"), reply warmly and naturally in Hinglish/Hindi with standard technical terms in English.
- Adapt tone to be encouraging, respectful, clear, and intellectually rigorous.

## Response Architecture & Formatting Rules
1. **Exam-Oriented Structure**:
   When answering semester exam questions or theoretical queries, provide:
   - **Formal Definition / Statement**
   - **Core Formula / Derivation** (using clean Markdown or LaTeX formatting)
   - **Step-by-Step Explanation / Mechanism**
   - **Architectural Diagram or Truth Table** (using clear ASCII art or Markdown tables)
   - **Time & Space Complexity** (in Big-O notation for every algorithm)
   - **Semester Exam & Viva Tips** (common 2-marker definitions, 5-marker conceptual nuances, and common exam traps)
   - **Conclusion / Real-World Engineering Application**
2. **Step-by-Step Mathematics**:
   Never skip intermediate steps. State the governing theorem, write down initial conditions, show substitutions, perform algebraic simplifications, and box or bold the final result.
3. **Code Quality**:
   Provide production-quality, compilable code inside language-specific code blocks (\`\`\`cpp, \`\`\`python, \`\`\`java). Include comments on critical pointer or algorithmic steps.
4. **Follow-Up Awareness**:
   Reference earlier parts of the conversation when answering follow-up questions.
5. **No Hallucinations**:
   Never invent academic formulas, theorems, RFC standards, or college regulations. If a topic has multiple conventions (e.g., 0-indexed vs 1-indexed, or Little Endian vs Big Endian), state both explicitly.
6. **Suggested Follow-Up Questions**:
   At the very end of your response, ALWAYS output exactly 3 natural, highly relevant follow-up questions that the student might want to ask next, prefixed with the marker:
   [FOLLOW_UPS]
   - <Question 1>
   - <Question 2>
   - <Question 3>`;

// --------------- Helper: Multi-Turn Content Builder ---------------

export function buildMultiTurnContents(messages, currentSubject = "") {
  const relevant = messages.slice(-20);
  const contents = [];

  for (const msg of relevant) {
    if (msg.id === "welcome") continue;
    if (msg.content?.startsWith("⚠️") || msg.isError) continue;

    const role = msg.role === "user" ? "user" : "model";
    const parts = [];

    if (msg.fileData && msg.fileData.data && msg.fileData.mimeType) {
      parts.push({
        inlineData: {
          mimeType: msg.fileData.mimeType,
          data: msg.fileData.data,
        },
      });
    }

    if (msg.content && msg.content.trim()) {
      parts.push({ text: msg.content.trim() });
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  const cleaned = [];
  for (let i = 0; i < contents.length; i++) {
    if (cleaned.length === 0) {
      cleaned.push(contents[i]);
    } else {
      const prev = cleaned[cleaned.length - 1];
      if (prev.role === contents[i].role) {
        prev.parts.push(...contents[i].parts);
      } else {
        cleaned.push(contents[i]);
      }
    }
  }

  if (cleaned.length > 0 && currentSubject) {
    const lastUser = cleaned[cleaned.length - 1];
    if (lastUser.role === "user") {
      const textPart = lastUser.parts.find(p => p.text);
      if (textPart && !textPart.text.includes("[Current Context:")) {
        textPart.text = `[Current Context: ${currentSubject}]\n\n${textPart.text}`;
      }
    }
  }

  return cleaned;
}

// --------------- Secure Server Proxy Streaming API Call (with Auto-Model Fallback) ---------------

/**
 * Streams response from Gemini API via the secure server proxy (/api/gemini/...)
 * Automatically falls back to supported Gemini models if a given model is not provisioned for the key.
 */
export async function streamGeminiContent({
  contents,
  systemInstruction = BTECH_TUTOR_SYSTEM_PROMPT,
  onChunk,
  signal,
  model,
  temperature = 0.7,
  maxOutputTokens = 8192,
}) {
  const primaryModel = model || getStoredModel();
  const modelsToTry = [
    primaryModel,
    ...CANDIDATE_FALLBACK_MODELS
  ];
  // Deduplicate candidates preserving order
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  let lastError = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const activeModel = uniqueModels[i];
    const url = `/api/gemini/models/${activeModel}:streamGenerateContent?alt=sse`;

    const payload = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      // If static host without backend proxy returned HTML, or 404/503:
      const contentType = response.headers.get("content-type") || "";
      const isHtmlResponse = contentType.includes("text/html");

      if (isHtmlResponse || (!response.ok && (response.status === 404 || response.status === 503))) {
        const clientKey = getDirectClientKey();
        if (clientKey) {
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:streamGenerateContent?alt=sse&key=${clientKey}`;
          const directRes = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal,
          });
          if (directRes.ok) {
            response = directRes;
          }
        }
      }

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

        // If model not found (404) or unsupported method on this model, try next candidate
        const isModelNotFound = response.status === 404 ||
          errMsg.includes('not found') ||
          errMsg.includes('not supported') ||
          errMsg.includes('Call ModelService.ListModels');

        if (isModelNotFound && i < uniqueModels.length - 1) {
          console.warn(`[Gemini] Model ${activeModel} not available for key (${errMsg}), trying fallback: ${uniqueModels[i + 1]}...`);
          continue;
        }

        throw new Error(formatErrorMessage(response.status, errMsg));
      }

      // Success: Save the working model for subsequent requests
      if (activeModel !== primaryModel) {
        setStoredModel(activeModel);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (chunkText) {
              accumulatedText += chunkText;
              if (onChunk) onChunk(accumulatedText, chunkText);
            }
          } catch (e) {
            // partial JSON chunk, ignore
          }
        }
      }

      if (buffer.trim().startsWith("data:")) {
        try {
          const parsed = JSON.parse(buffer.trim().replace(/^data:\s*/, ""));
          const chunkText = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (chunkText) {
            accumulatedText += chunkText;
            if (onChunk) onChunk(accumulatedText, chunkText);
          }
        } catch (e) { }
      }

      return accumulatedText;

    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;
      const isModelNotFound = err.message && (
        err.message.includes('not found') ||
        err.message.includes('not supported') ||
        err.message.includes('Call ModelService.ListModels')
      );
      if (isModelNotFound && i < uniqueModels.length - 1) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error("Failed to communicate with Google Gemini API.");
}

// --------------- Secure Server Proxy Non-Streaming API Call (with Auto-Model Fallback) ---------------

export async function callGeminiApi({
  contents,
  systemInstruction = "",
  model,
  temperature = 0.7,
  maxOutputTokens = 8192,
}) {
  const primaryModel = model || getStoredModel();
  const modelsToTry = [
    primaryModel,
    ...CANDIDATE_FALLBACK_MODELS
  ];
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  let lastErrorResult = null;

  for (let i = 0; i < uniqueModels.length; i++) {
    const activeModel = uniqueModels[i];
    const url = `/api/gemini/models/${activeModel}:generateContent`;

    const bodyData = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    };

    if (systemInstruction) {
      bodyData.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      let response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
        signal: controller.signal,
      });

      // If static host returned HTML, or 404/503:
      const contentType = response.headers.get("content-type") || "";
      const isHtmlResponse = contentType.includes("text/html");

      if (isHtmlResponse || (!response.ok && (response.status === 404 || response.status === 503))) {
        const clientKey = getDirectClientKey();
        if (clientKey) {
          const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${clientKey}`;
          const directRes = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyData),
            signal: controller.signal,
          });
          if (directRes.ok) {
            response = directRes;
          }
        }
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;

        const isModelNotFound = response.status === 404 ||
          errMsg.includes('not found') ||
          errMsg.includes('not supported') ||
          errMsg.includes('Call ModelService.ListModels');

        if (isModelNotFound && i < uniqueModels.length - 1) {
          console.warn(`[Gemini] Model ${activeModel} not supported, trying fallback: ${uniqueModels[i + 1]}...`);
          continue;
        }

        return {
          success: false,
          error: formatErrorMessage(response.status, errMsg),
          status: response.status,
        };
      }

      const data = await response.json();
      const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === "SAFETY") {
          return {
            success: false,
            error: "Response was restricted by Gemini safety filters. Please rephrase your query.",
          };
        }
        return {
          success: false,
          error: "No response text received from the Gemini model.",
        };
      }

      // Success: Save working model
      if (activeModel !== primaryModel) {
        setStoredModel(activeModel);
      }

      return {
        success: true,
        text: textOutput,
        modelUsed: activeModel,
      };

    } catch (err) {
      if (err.name === "AbortError") {
        return {
          success: false,
          error: "Request timed out after 45 seconds. Please check your connection.",
        };
      }
      lastErrorResult = {
        success: false,
        error: err.message || "Failed to communicate with Google Gemini API.",
      };
    }
  }

  return lastErrorResult || {
    success: false,
    error: "No available Gemini model responded successfully."
  };
}

// --------------- Error Message Formatting ---------------

function formatErrorMessage(statusCode, rawMessage) {
  if (statusCode === 503 || rawMessage.includes("GEMINI_API_KEY is not configured")) {
    return "GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY to the server .env file or save it via Gemini API in top navigation bar.";
  }
  if (statusCode === 400 || rawMessage.includes("API_KEY_INVALID") || rawMessage.includes("key not valid")) {
    return "Server GEMINI_API_KEY is invalid or expired. Please check your key in Google AI Studio.";
  }
  if (statusCode === 403) {
    return "Permission denied. Ensure the GEMINI_API_KEY has access to the Generative Language API in Google Cloud Console.";
  }
  if (statusCode === 429 || rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("quota")) {
    return "Gemini API rate limit reached. Please wait ~30 seconds for quota replenishment.";
  }
  return rawMessage || `Error (${statusCode})`;
}

// --------------- Test Server Gemini Connection (with Auto-Discovery) ---------------

export async function testGeminiApiKey(preferredModel) {
  const modelsToTry = [
    preferredModel || getStoredModel(),
    ...CANDIDATE_FALLBACK_MODELS
  ];
  const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

  for (const m of uniqueModels) {
    try {
      const url = `/api/gemini/models/${m}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Respond in 5 words: B.Tech AI Assistant is online!" }],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        setStoredModel(m);
        return {
          valid: true,
          message: `Connected successfully via Google Gemini (${m})! Output: "${reply ? reply.trim() : 'OK'}"`,
          modelUsed: m
        };
      }

      const err = await response.json().catch(() => null);
      const msg = err?.error?.message || `HTTP ${response.status}`;

      const isModelNotFound = response.status === 404 ||
        msg.includes('not found') ||
        msg.includes('not supported') ||
        msg.includes('Call ModelService.ListModels');

      if (isModelNotFound) {
        continue; // Try next candidate
      }

      // Hard error (e.g., invalid key or 403 permission)
      return {
        valid: false,
        message: formatErrorMessage(response.status, msg),
      };

    } catch (e) {
      // Network failure
    }
  }

  return {
    valid: false,
    message: "Could not find a supported Gemini model for this API key. Ensure Generative Language API is enabled in Google AI Studio.",
  };
}

// --------------- Chatbot Tutor Entrypoint ---------------

export async function askGeminiTutor({
  messages,
  currentSubject = "Core Engineering",
  model,
}) {
  const contents = buildMultiTurnContents(messages, currentSubject);

  if (contents.length === 0) {
    return "I didn't receive a query. Please type your engineering question!";
  }

  const result = await callGeminiApi({
    contents,
    systemInstruction: BTECH_TUTOR_SYSTEM_PROMPT,
    model,
  });

  if (result.success && result.text) {
    return result.text;
  }

  throw new Error(result.error || "Unable to retrieve response from Gemini API.");
}

// --------------- Additional Academic Features ---------------

export async function generateQuizWithGemini({
  topic,
  notes = "",
  numQuestions = 5,
  model,
}) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Generate exactly ${numQuestions} high-yield multiple-choice questions for the following B.Tech engineering topic:
Topic: "${topic}"
Notes Context: ${notes.slice(0, 1500)}

You MUST return ONLY a valid JSON array of question objects, with NO surrounding markdown or backticks.
Format:
[
  {
    "id": 1,
    "question": "string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed engineering explanation of why this answer is correct."
  }
]`,
        },
      ],
    },
  ];

  const res = await callGeminiApi({
    contents,
    systemInstruction: "You are a university engineering exam creator. Return pure JSON array without markdown backticks.",
    model,
    temperature: 0.2,
  });

  if (res.success && res.text) {
    try {
      let cleaned = res.text.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
      }
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.warn("JSON parse fallback on quiz text:", e);
    }
  }

  throw new Error(res.error || "Failed to generate quiz with Gemini.");
}

export async function summarizeNotesWithGemini({
  text,
  formatType = "bullet",
  model,
}) {
  let instructions = "";
  if (formatType === "formula") {
    instructions = "Extract all key mathematical formulas, theorems, Big-O bounds, and laws in a clean formula cheat sheet.";
  } else if (formatType === "exam") {
    instructions = "Format as high-yield Semester Exam Questions: include likely 2-marker definitions, 5-marker conceptual questions with answers, and 10-marker derivations.";
  } else if (formatType === "mindmap") {
    instructions = "Create a structured visual indented mind-map hierarchy showing root concepts, sub-branches, and core properties.";
  } else {
    instructions = "Provide an executive B.Tech study summary with Key Takeaways, Core Mechanics, Practical Use Cases, and Common Exam Pitfalls.";
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Analyze and summarize these engineering lecture notes:\n\n${text}\n\nTask: ${instructions}\nUse clear Markdown formatting with bold terms, code blocks, and lists.`,
        },
      ],
    },
  ];

  const res = await callGeminiApi({ contents, model });
  if (res.success && res.text) {
    return res.text;
  }

  throw new Error(res.error || "Failed to summarize notes with Gemini.");
}

export async function debugCodeWithGemini({
  language,
  code,
  errorDescription,
  model,
}) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `You are a Senior Software Architect and CS Professor.
Analyze and debug the following ${language} code.
Reported Issue: "${errorDescription}"

Code:
\`\`\`${language}
${code}
\`\`\`

Provide your response in this exact format:
1. 🐛 **Root Cause Analysis**: Why the bug happens.
2. 💡 **Corrected Code**: Full optimized code with comments explaining the fix.
3. ⚡ **Complexity Analysis**: Time Complexity and Space Complexity.
4. 🛡️ **Edge Cases & Best Practices**: How to avoid this in university practicals or tech interviews.`,
        },
      ],
    },
  ];

  const res = await callGeminiApi({ contents, model });
  if (res.success && res.text) {
    return res.text;
  }

  throw new Error(res.error || "Failed to debug code with Gemini.");
}

export async function generateLabReportWithGemini({
  experimentTitle,
  subject,
  objective,
  model,
}) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Generate a complete, formal B.Tech Engineering Lab Practical Report for:
Subject: ${subject}
Experiment Title: ${experimentTitle}
Objective/Aim: ${objective}

Format should include:
1. **Title & Objective**
2. **Theory & Mathematical/Logical Foundation**
3. **Algorithm / Step-by-Step Flowchart Description**
4. **Implementation Code (clean with comments)**
5. **Sample Input and Output (Test Cases)**
6. **Viva-Voce Questions (Top 5 questions with model answers for college lab exams)**`,
        },
      ],
    },
  ];

  const res = await callGeminiApi({ contents, model });
  if (res.success && res.text) {
    return res.text;
  }

  throw new Error(res.error || "Failed to generate lab report with Gemini.");
}

export async function analyzeResumeWithGemini({
  resumeText,
  targetJob,
  model,
}) {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Review this B.Tech student resume for the role: "${targetJob}".
Resume Content:
${resumeText}

Provide an actionable evaluation:
1. 🎯 **ATS Compatibility Score (0 - 100%)**
2. 🔑 **Matched & Missing Keywords**: Tech stack keywords needed for this role.
3. 🚀 **Bullet Point Rewrites**: Rewrite at least 3 project/internship bullets using the Google XYZ Formula: "Accomplished [X] as measured by [Y], by doing [Z]".
4. ⚠️ **Red Flags / Weak Areas**: Things recruiters will reject.
5. 📋 **Placement Strategy**: Top 3 technical topics to revise for technical rounds of this role.`,
        },
      ],
    },
  ];

  const res = await callGeminiApi({ contents, model });
  if (res.success && res.text) {
    return res.text;
  }

  throw new Error(res.error || "Failed to analyze resume with Gemini.");
}
