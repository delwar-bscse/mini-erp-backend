import { StatusCodes } from "http-status-codes";
import { ProductModel } from "./product.model";
import ApiError from "../../../errors/ApiErrors";
import { CategoryModel } from "../category/category.model";
import { IProduct } from "./product.interface";
import { unlinkFile } from "../../../shared/unlinkFile";
import { FilterQuery, PipelineStage, Types } from "mongoose";

//create product
const createProductToDB = async (payload: Partial<IProduct>): Promise<any> => {
  const isCategoryExist = await CategoryModel.findOne({
    _id: payload.category,
  });
  if (!isCategoryExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Product category doesn't exist!",
    );
  }
  if (!payload.purchase_price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Service price is required!");
  }

  const res = await ProductModel.create(payload);

  return { data: res };
};

// update product
const updateProductToDB = async (
  id: string,
  payload: Partial<IProduct>,
): Promise<any> => {
  const isCategoryExist = await CategoryModel.findOne({
    _id: payload.category,
  });
  if (!isCategoryExist) {
    if (payload?.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Product category doesn't exist!",
    );
  }

  const isExistProduct = await ProductModel.findOne({
    _id: id,
  });
  if (!isExistProduct) {
    if (payload?.image) {
      unlinkFile(payload.image);
    }
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product doesn't exist!");
  }

  const res = await ProductModel.findOneAndUpdate(
    { _id: id },
    { $set: payload },
    { new: true },
  );
  if (
    res &&
    isExistProduct?.image &&
    res?.image &&
    res.image !== isExistProduct?.image
  ) {
    unlinkFile(isExistProduct.image);
  }

  return { data: res };
};

// get all products
const getAllProductsFromDB = async (
  query: FilterQuery<IProduct>,
): Promise<any> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const match: Record<string, any> = {};

  // Search by name or sku
  if (query.searchTerm) {
    match.$or = [
      {
        name: {
          $regex: query.searchTerm,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: query.searchTerm,
          $options: "i",
        },
      },
    ];
  }

  // Filter by category
  if (query.category) {
    match.category = new Types.ObjectId(query.category as string);
  }

  // Filter by selling price
  if (query.minPrice || query.maxPrice) {
    match.selling_price = {};

    if (query.minPrice) match.selling_price.$gte = Number(query.minPrice);

    if (query.maxPrice) match.selling_price.$lte = Number(query.maxPrice);
  }

  // Filter by stock quantity
  if (query.minStock || query.maxStock) {
    match.stock_quantity = {};

    if (query.minStock) match.stock_quantity.$gte = Number(query.minStock);

    if (query.maxStock) match.stock_quantity.$lte = Number(query.maxStock);
  }

  const pipeline: PipelineStage[] = [
    {
      $match: match,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        pagination: [{ $count: "total" }],
      },
    },
    {
      $project: {
        data: 1,
        pagination: {
          total: {
            $ifNull: [{ $arrayElemAt: ["$pagination.total", 0] }, 0],
          },
          page: { $literal: page },
          limit: { $literal: limit },
          totalPage: {
            $ceil: {
              $divide: [
                {
                  $ifNull: [{ $arrayElemAt: ["$pagination.total", 0] }, 0],
                },
                limit,
              ],
            },
          },
        },
      },
    },
  ];

  const [result] = await ProductModel.aggregate(pipeline);

  return result;
};

// update product
const getSingleProductToDB = async (id: string): Promise<any> => {
  const isExistProduct = await ProductModel.findById(id);
  if (!isExistProduct) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product doesn't exist!");
  }

  return { data: isExistProduct };
};

// update product
const deleteProductToDB = async (id: string): Promise<any> => {
  const res = await ProductModel.findByIdAndDelete({ _id: id }, { new: true });
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product doesn't exist!");
  }
  if (res?.image) {
    unlinkFile(res.image);
  }

  return { data: res };
};

export const ProductService = {
  createProductToDB,
  updateProductToDB,
  deleteProductToDB,
  getAllProductsFromDB,
  getSingleProductToDB,
};
