import { Model, Types } from "mongoose";

export type IProduct = {
  name: string;
  sku: string;
  category: Types.ObjectId;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  image?: string;
};

export type IProductModal = Model<IProduct>;
