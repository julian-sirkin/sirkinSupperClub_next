import { z } from "zod";

export const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{0,14}$/, "Invalid phone number format")
    .length(10, "Phone number must be exactly 10 digits"),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
});

export type FormData = z.infer<typeof schema>;
