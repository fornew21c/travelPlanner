import { z } from "zod";

import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import {
  buildItineraryPrompt,
  buildPackingPrompt,
  type ItineraryPromptInput,
  type PackingPromptInput,
} from "./prompts";
import {
  itineraryDaySchema,
  itineraryResponseSchema,
  packingResponseSchema,
  type ItineraryResponse,
  type PackingResponse,
} from "./schema";
import type { AIProvider, AIProviderName } from "./types";

/**
 * High-level AI service. Callers should use these functions instead of
 * touching providers directly — the provider is chosen by env at runtime
 * and the response is validated by Zod before being returned.
 */

function getProvider(override?: AIProviderName): AIProvider {
  const choice = override ?? (process.env.AI_PROVIDER as AIProviderName | undefined) ?? "openai";
  switch (choice) {
    case "anthropic":
      return new AnthropicProvider();
    case "openai":
    default:
      return new OpenAIProvider();
  }
}

/**
 * Extracts the first balanced JSON object from a model response.
 * Models occasionally wrap output in ```json fences or leading prose; we
 * defensively strip those before parsing.
 */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

async function completeStructured<T>(
  // Allow the schema's *input* type to differ from its output `T`. Zod's
  // `.default()`/`.optional()` make parsed input optional while the inferred
  // output (`z.infer`) is required, so `z.ZodSchema<T>` (input === output) would
  // reject these schemas. We parse from `unknown` anyway.
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  prompt: { system: string; user: string },
  options?: { provider?: AIProviderName; temperature?: number; maxTokens?: number },
): Promise<{ data: T; provider: AIProviderName; model: string }> {
  const provider = getProvider(options?.provider);
  const result = await provider.complete({
    system: prompt.system,
    user: prompt.user,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(result.text));
  } catch (err) {
    console.error("[AI] JSON parse failed. Raw response:\n", result.text);
    throw new Error(
      `AI returned invalid JSON (provider=${provider.name}): ${(err as Error).message}`,
    );
  }

  const validation = schema.safeParse(parsed);
  if (!validation.success) {
    console.error("[AI] Schema validation failed:");
    console.error("  Zod issues:", JSON.stringify(validation.error.issues, null, 2));
    console.error("  Parsed payload:", JSON.stringify(parsed, null, 2).slice(0, 2000));
    throw new Error(
      `AI response failed schema validation: ${validation.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")} → ${i.message}`)
        .join("; ")}`,
    );
  }

  return { data: validation.data, provider: provider.name, model: provider.model };
}

// ---------------------------------------------------------------------------
// Public functions
// ---------------------------------------------------------------------------

export async function generateItinerary(
  input: ItineraryPromptInput,
  options?: { provider?: AIProviderName },
) {
  // Scale tokens with trip length so long itineraries don't get truncated.
  // gpt-4o-mini supports up to 16384 output tokens.
  const maxTokens = Math.min(16000, 2000 + input.durationDays * 1200);

  // Enforce date consistency at the schema level: exactly durationDays days,
  // with day_index forming a contiguous 1..N sequence. The prompt asks for this
  // too; this is the hard backstop so a miscounted itinerary fails validation
  // (the action keeps the draft and surfaces an error) rather than silently
  // producing a trip with the wrong number of days.
  const constrainedSchema = itineraryResponseSchema.extend({
    days: z
      .array(itineraryDaySchema)
      .length(input.durationDays, `정확히 ${input.durationDays}일치 일정이 필요합니다`)
      .refine(
        (days) => {
          const indices = days.map((d) => d.day_index).sort((a, b) => a - b);
          return indices.every((v, i) => v === i + 1);
        },
        { message: "day_index는 1부터 빠짐/중복 없이 연속이어야 합니다" },
      ),
  });

  return completeStructured<ItineraryResponse>(
    constrainedSchema,
    buildItineraryPrompt(input),
    { ...options, maxTokens, temperature: 0.7 },
  );
}

export async function generatePackingList(
  input: PackingPromptInput,
  options?: { provider?: AIProviderName },
) {
  return completeStructured<PackingResponse>(
    packingResponseSchema,
    buildPackingPrompt(input),
    { ...options, maxTokens: 3000, temperature: 0.6 },
  );
}

export type { ItineraryResponse, PackingResponse };
