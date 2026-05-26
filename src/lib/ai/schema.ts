import { z } from "zod";

/**
 * Schemas describing the structured JSON we expect AI providers to return.
 * Used both to (a) instruct the model and (b) safely parse its output.
 *
 * Keep field names in English; the AI returns Korean *values* (title, desc).
 */

export const itineraryItemSchema = z.object({
  type: z.enum([
    "attraction",
    "restaurant",
    "transport",
    "accommodation",
    "activity",
    "rest",
    "note",
  ]),
  title: z.string().min(1),
  description: z.string().optional().default(""),
  location_name: z.string().optional().default(""),
  address: z.string().optional().default(""),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  estimated_cost_krw: z.number().int().nonnegative().default(0),
  child_friendly: z.boolean().default(true),
  tips: z.string().optional().default(""),
});

export const itineraryDaySchema = z.object({
  day_index: z.number().int().min(1),
  title: z.string().min(1),
  summary: z.string().optional().default(""),
  items: z.array(itineraryItemSchema).min(1),
});

export const itineraryResponseSchema = z.object({
  summary: z.string(),
  days: z.array(itineraryDaySchema).min(1),
  total_estimated_cost_krw: z.number().int().nonnegative(),
  transportation_recommendation: z.string(),
});

export type ItineraryResponse = z.infer<typeof itineraryResponseSchema>;

export const packingItemSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  for_child: z.boolean().default(false),
  notes: z.string().optional().default(""),
});

export const packingResponseSchema = z.object({
  items: z.array(packingItemSchema).min(1),
});

export type PackingResponse = z.infer<typeof packingResponseSchema>;
