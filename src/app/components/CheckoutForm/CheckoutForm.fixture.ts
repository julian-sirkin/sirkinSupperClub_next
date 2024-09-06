import { z } from "zod";

export const schema = z.object({
  name: z.string().trim().min(1, {
    message: "Name is required",
  }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phoneNumber: z
    .string()
    .regex(
      /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
      "Invalid phone number"
    ),
  notes: z.string().trim().optional(),
  dietaryRestrictions: z.string().trim().optional(),
});

export type FormData = z.infer<typeof schema>;
