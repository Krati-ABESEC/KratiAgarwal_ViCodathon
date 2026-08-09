type ChatTurn = {
  role: "assistant" | "user";
  content: string;
};

type GeminiResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

/**
 * Calls Google's Gemini API directly through its official OpenAI-compatible
 * chat-completions endpoint. This runs only on the server.
 */
export async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  turns: ChatTurn[],
) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          ...turns.map((turn) => ({ role: turn.role, content: turn.content })),
        ],
      }),
    },
  );

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Gemini API request failed (${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Gemini API returned an empty response");
  return text;
}
