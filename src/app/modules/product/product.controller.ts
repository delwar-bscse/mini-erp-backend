import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ProductService } from "./product.service";
import pick from "../../../helpers/pick";

//create service controller
const createProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProductToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product created successfully",
    data: result.data,
  });
});

// get all products
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  // 1. Define which query fields are filters
  const acceptableFields = [
    "searchTerm",
    "minPrice",
    "maxPrice",
    "minStock",
    "maxStock",
    "category",
    "page",
    "limit",
  ];

  // 2. Pick only allowed filters from req.query
  const filterOptions = pick(req.query, acceptableFields);

  const result = await ProductService.getAllProductsFromDB(filterOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result.data,
    pagination: result.pagination[0],
  });
});

// get single product
const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.getSingleProductToDB(id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result.data,
  });
});

//update product controller
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.updateProductToDB(id as string, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product updated successfully",
    data: result.data,
  });
});

//update service controller
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteProductToDB(id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result.data,
  });
});

export const ProductController = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
};
