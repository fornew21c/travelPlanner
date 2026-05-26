/**
 * Provider-agnostic AI interface.
 *
 * Adapters (anthropic.ts, openai.ts) implement this. Callers depend only
 * on this interface, so swapping providers is a one-line env change.
 */

export interface AICompletionRequest {
  system: string;
  user: string;
  /** Hard cap on response tokens. */
  maxTokens?: number;
  /** Lower = more deterministic. We default to ~0.7 for creative planning. */
  temperature?: number;
}

export interface AICompletionResult {
  text: string;
  provider: AIProviderName;
  model: string;
  /** Raw token usage if the provider exposes it. */
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

export type AIProviderName = "anthropic" | "openai";

export interface AIProvider {
  readonly name: AIProviderName;
  readonly model: string;
  /** Request a JSON-only completion. Throws on transport errors. */
  complete(req: AICompletionRequest): Promise<AICompletionResult>;
}
