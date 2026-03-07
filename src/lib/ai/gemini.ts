// This module only runs on the server — never import in Client Components
import { GoogleGenerativeAI } from "@google/generative-ai";

// Returns null if key is missing — callers must handle this
function getClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export type AIResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// Core wrapper — handles all errors, never throws
async function generateText(
  prompt: string,
  retries = 2,
): Promise<AIResult<string>> {
  const client = getClient();

  if (!client) {
    return {
      success: false,
      error: "AI features are not configured. Add GEMINI_API_KEY to enable.",
    };
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const text = result.response.text().trim();
    if (!text) return { success: false, error: "Empty response from AI" };

    return { success: true, data: text };
  } catch (err: unknown) {
    console.error("[Gemini error]", err);
    const message = err instanceof Error ? err.message : String(err);

    // Rate limited — wait 2 seconds and retry
    if (message.includes("429") && retries > 0) {
      console.log(
        `[Gemini] Rate limited, retrying in 2s... (${retries} retries left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return generateText(prompt, retries - 1);
    }

    if (message.includes("429")) {
      return {
        success: false,
        error: "AI is busy right now. Try again in a moment.",
      };
    }

    return { success: false, error: "AI suggestion unavailable right now." };
  }
}

// ─── Exported AI functions ────────────────────────────────────────────────

export async function suggestLogComment(input: {
  logType: "train" | "rest" | "active_recovery";
  prs: { exercise: string; value: number; unit: string }[];
  existingComment?: string;
}): Promise<AIResult<string>> {
  const prText =
    input.prs.length > 0
      ? `PRs logged: ${input.prs.map((p) => `${p.exercise} ${p.value}${p.unit}`).join(", ")}.`
      : "No PRs logged.";

  const typeText = {
    train: "a training day",
    rest: "a rest day",
    active_recovery: "an active recovery day",
  }[input.logType];

  const prompt = `
You are a fitness coach writing a brief, motivating daily log entry.
The athlete had ${typeText}. ${prText}
${input.existingComment ? `They started writing: "${input.existingComment}"` : ""}

Write a single short paragraph (2-3 sentences max) for their log.
Be specific, genuine, and encouraging — not generic.
Do not use hashtags, emojis, or bullet points.
Write in first person as if the athlete is writing it.
`.trim();

  return generateText(prompt);
}

export async function generateWeeklySummary(input: {
  logs: {
    log_date: string;
    type: string;
    comment: string | null;
  }[];
  prs: {
    exercise: string;
    value: number;
    unit: string;
    recorded_at: string;
  }[];
}): Promise<AIResult<string>> {
  if (input.logs.length === 0) {
    return { success: false, error: "No logs this week to summarize." };
  }

  const logSummary = input.logs
    .map(
      (l) => `${l.log_date}: ${l.type}${l.comment ? ` — "${l.comment}"` : ""}`,
    )
    .join("\n");

  const prSummary =
    input.prs.length > 0
      ? input.prs.map((p) => `${p.exercise}: ${p.value}${p.unit}`).join(", ")
      : "No PRs this week";

  const prompt = `
You are a fitness coach reviewing an athlete's training week.

Training log:
${logSummary}

Personal records set: ${prSummary}

Write a brief weekly summary (3-4 sentences) that:
1. Acknowledges the training volume and consistency
2. Highlights any PRs or strong performances
3. Gives one actionable suggestion for next week
Be direct, specific, and motivating. No bullet points or headers.
`.trim();

  return generateText(prompt);
}

export async function suggestExerciseName(
  partial: string,
): Promise<AIResult<string[]>> {
  if (partial.length < 2) return { success: false, error: "Too short" };

  const prompt = `
List 5 common gym exercises that start with or match "${partial}".
Respond with ONLY a JSON array of strings, no explanation.
Example: ["Back Squat", "Bench Press", "Bicep Curl"]
`.trim();

  const result = await generateText(prompt);
  if (!result.success) return result;

  try {
    const cleaned = result.data.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    return { success: true, data: parsed.slice(0, 5) };
  } catch {
    return { success: false, error: "Could not parse suggestions" };
  }
}
