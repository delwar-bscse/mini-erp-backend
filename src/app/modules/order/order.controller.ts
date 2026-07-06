import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { OrderService } from "./product.service";

//create order controller
const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrderToDB(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result.data,
    pagination: result.meta,
  });
});

const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getSingleOrderFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result.data,
  });
});

export const OrderController = {
  createOrder,
  getAllOrders,
  getSingleOrder,
};
