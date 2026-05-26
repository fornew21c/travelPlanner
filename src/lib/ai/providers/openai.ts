import OpenAI from "openai";

import type { AICompletionRequest, AICompletionResult, AIProvider } from "../types";

/**
 * OpenAI adapter. Uses the Chat Completions API with response_format=json_object
 * to coerce the response into valid JSON.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;
  readonly model: string;
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    this.model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    this.client = new OpenAI({ apiKey });
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return {
      text,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens,
        outputTokens: response.usage?.completion_tokens,
      },
    };
  }
}
