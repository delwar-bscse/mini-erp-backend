import { z } from "zod";

// 1. Create Product Schema
const createProductZodValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    sku: z.string({ required_error: "SKU is required" }),
    category: z.string({ required_error: "Category is required" }),
    purchase_price: z
      .number({ required_error: "Purchase Price is required" })
      .positive(),
    selling_price: z
      .number({ required_error: "Selling Price is required" })
      .positive(),
    stock_quantity: z
      .number({ required_error: "Stock Quantity is required" })
      .positive(),
    image: z.string({ required_error: "Image is required ........ !" }),
  }),
});

// 2. Update Product Schema
const updateProductZodValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    category: z.string().optional(),
    purchase_price: z.number().positive().optional(),
    selling_price: z.number().positive().optional(),
    stock_quantity: z.number().positive().optional(),
    image: z.string().optional(),
  }),
});

export const ProductValidation = {
  createProductZodValidationSchema,
  updateProductZodValidationSchema,
};
