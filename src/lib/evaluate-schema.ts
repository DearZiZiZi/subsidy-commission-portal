import { z } from "zod";
import { DIRECTIONS, REGIONS } from "@/types/scoring";

const dirSet = new Set<string>(DIRECTIONS);
const regSet = new Set<string>(REGIONS);

export const meritFormSchema = z.object({
  applicant_id: z.string().min(1, "Укажите идентификатор"),
  direction: z
    .string()
    .refine((v) => dirSet.has(v), { message: "Выберите направление" }),
  standard: z.number().int().positive(),
  subsidy_purpose: z.string().min(1, "Опишите цель"),
  requested_amount: z.number().int().nonnegative(),
  region: z.string().refine((v) => regSet.has(v), { message: "Выберите область" }),
  month: z.number().int().min(1).max(12),
  farm_area: z.string().min(1, "Укажите район"),
});

export type MeritFormValues = z.infer<typeof meritFormSchema>;
