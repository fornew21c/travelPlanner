import Anthropic from "@anthropic-ai/sdk";

import type { AICompletionRequest, AICompletionResult, AIProvider } from "../types";

/**
 * Anthropic adapter. We default to the latest Sonnet model and ask the
 * model to respond with pure JSON. We do *not* use vendor-specific JSON-mode
 * flags here so the provider remains swappable with OpenAI.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic" as const;
  readonly model: string;
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    this.model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
    this.client = new Anthropic({ apiKey });
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 4096,
      temperature: req.temperature ?? 0.7,
      system: req.system,
      messages: [{ role: "user", content: req.user }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      text,
      provider: this.name,
      model: this.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
