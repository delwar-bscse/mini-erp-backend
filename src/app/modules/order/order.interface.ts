import { Model, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrder {
  items: IOrderItem[];
  totalAmount: number;
  note?: string;
  createdBy: Types.ObjectId;
}

export type IOrderModel = Model<IOrder>;
