import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../../helpers/pick";

// register user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  },
);

// retrieve profile
const retrieveProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.retrieveProfileFromDB(
    req.user as JwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // 1. Define which query fields are filters
  const acceptableFields = ["searchTerm", "isActive", "role", "page", "limit"];

  // 2. Pick only allowed filters from req.query
  const filterOptions = pick(req.query, acceptableFields);

  const result = await UserService.getAllUsersFromDB(filterOptions);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    data: result.data,
    pagination: result.pagination,
  });
});

// single user
const getUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserFromDB(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

// admin: delete user
const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.deleteUserFromDB(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User deleted successfully",
      data: result,
    });
  },
);

//update profile
const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateUserProfileToDB(
      req.params.id as string,
      req.body,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Profile updated successfully",
      data: result.data,
    });
  },
);

// active or block user
const activeBlockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.activeBlockUserFromDB(
      req.params.id as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: result.message,
      data: result.data,
    });
  },
);

export const UserController = {
  createUser,
  retrieveProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  activeBlockUser,
  getUser,
};
