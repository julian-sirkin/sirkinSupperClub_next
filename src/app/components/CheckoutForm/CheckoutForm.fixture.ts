import { z } from "zod";

export const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phoneNumber: z.preprocess(
    (value) =>
      typeof value === "string" ? value.replace(/\D/g, "").slice(0, 10) : value,
    z
      .string()
      .length(10, "Please enter a valid 10-digit phone number")
  ),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
});

export type FormData = z.infer<typeof schema>;
