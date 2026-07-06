import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createOrderZodValidationSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          product: z
            .string({
              required_error: "Product is required",
            })
            .regex(objectIdRegex, "Invalid product id"),
          quantity: z
            .number({
              required_error: "Quantity is required",
            })
            .int()
            .min(1, "Quantity must be at least 1"),
        }),
      )
      .min(1, "At least one product is required"),
    note: z
      .string()
      .trim()
      .max(500, "Note cannot exceed 500 characters")
      .optional(),
  }),
});

export const OrderValidation = {
  createOrderZodValidationSchema,
};
