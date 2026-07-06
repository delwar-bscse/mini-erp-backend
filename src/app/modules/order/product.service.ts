import mongoose, { FilterQuery } from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IOrder } from "./order.interface";
import { OrderModel } from "./order.model";
import { ProductModel } from "../product/product.model";
import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../../helpers/QueryBuilder";

//create Order
const createOrderToDB = async (
  user: JwtPayload,
  payload: Partial<IOrder>,
): Promise<any> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!payload.items || payload.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Order items are required.");
    }

    let totalAmount = 0;

    for (const item of payload.items) {
      const product = await ProductModel.findById(item.product).session(
        session,
      );

      if (!product) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Product not found.");
      }

      if (product.stock_quantity < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Product name "${product.name}" is out of stock.`,
        );
      }

      totalAmount += product.selling_price * item.quantity;

      // Update stock
      product.stock_quantity -= item.quantity;
      await product.save({ session });
    }

    const [order] = await OrderModel.create(
      [
        {
          items: payload.items,
          totalAmount,
          note: payload.note,
          createdBy: user.id,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// get all orders
const getAllOrdersFromDB = async (query: FilterQuery<IOrder>): Promise<any> => {
  const builder = new QueryBuilder<IOrder>(OrderModel.find(), query);

  const usersQuery = builder
    .search(["note"])
    .filter()
    .sort(["-createdAt"])
    .populate(["createdBy", "items.product"], {
      createdBy: "name email",
      "items.product": "name selling_price sku image",
    })
    .paginate()
    .fields();

  const [data, meta] = await Promise.all([
    usersQuery.modelQuery.lean().exec(),
    builder.getPaginationInfo(),
  ]);

  return { data, meta };
};

// get single order
const getSingleOrderFromDB = async (id: string): Promise<any> => {
  const data = await OrderModel.findById(id)
    .populate({
      path: "createdBy",
      select: "name email",
    })
    .populate({
      path: "items.product",
      select: "name selling_price sku image",
      populate: {
        path: "category",
      },
    })
    .lean()
    .exec();

  return { data };
};

export const OrderService = {
  createOrderToDB,
  getAllOrdersFromDB,
  getSingleOrderFromDB,
};
