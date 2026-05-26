import { z } from "zod";

/**
 * Shared trip form schema. Used by both client-side react-hook-form
 * resolution and server-side action validation.
 */

export const travelStyleEnum = z.enum([
  "relaxed",
  "sightseeing",
  "adventure",
  "cultural",
  "foodie",
  "shopping",
  "balanced",
]);

export const transportEnum = z.enum(["public", "rental_car", "taxi", "walking", "mixed"]);
export const paceEnum = z.enum(["slow", "moderate", "packed"]);

export const tripFormSchema = z
  .object({
    destination: z.string().min(2, "목적지를 입력해주세요").max(80),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "출발일을 선택해주세요"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "복귀일을 선택해주세요"),
    budget: z.coerce.number().int().min(0, "0 이상이어야 합니다"),
    adults: z.coerce.number().int().min(1, "최소 1명").max(10),
    children: z.coerce.number().int().min(0).max(10),
    childAges: z.string().optional().default(""), // CSV in form, parsed to number[]
    travelStyle: travelStyleEnum.default("balanced"),
    transport: transportEnum.default("mixed"),
    pace: paceEnum.default("moderate"),
    notes: z.string().max(500).optional().default(""),
  })
  .superRefine((val, ctx) => {
    if (new Date(val.endDate) < new Date(val.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "복귀일은 출발일 이후여야 합니다",
      });
    }
    const ages = parseChildAges(val.childAges);
    if (val.children > 0 && ages.length !== val.children) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["childAges"],
        message: `아이 ${val.children}명의 나이를 콤마로 구분해 입력해주세요`,
      });
    }
  });

export type TripFormValues = z.infer<typeof tripFormSchema>;

export function parseChildAges(input: string | undefined | null): number[] {
  if (!input) return [];
  return input
    .split(/[,，]/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 18);
}

export function diffDaysInclusive(startISO: string, endISO: string): number {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}
