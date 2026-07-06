import { model, Schema } from "mongoose";
import { IProduct, IProductModal } from "./product.interface";

const productSchema = new Schema<IProduct, IProductModal>(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    purchase_price: {
      type: Number,
      required: true,
    },
    selling_price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const ProductModel = model<IProduct, IProductModal>(
  "Product",
  productSchema,
);
