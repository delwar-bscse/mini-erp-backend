import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { UserModel } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../../helpers/QueryBuilder";
import { FilterQuery } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../../config";

// create user to DB
const createUserToDB = async (payload: Partial<IUser>): Promise<any> => {
  let createUser: IUser = {} as IUser;

  const isExistUser = await UserModel.isExistUserByEmail(
    payload?.email as string,
  );

  if (isExistUser?.verified) {
    throw new ApiError(StatusCodes.CONFLICT, "User already exist!");
  }

  createUser = await UserModel.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  return {
    message: "User created successfully",
    data: createUser,
  };
};

// retrieve profile
const retrieveProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;

  const isExistUser: any = await UserModel.findById(id).lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

// update profile
const updateUserProfileToDB = async (
  id: string,
  payload: Partial<IUser>,
): Promise<{ data: Partial<IUser | null> }> => {
  const isExistUser = await UserModel.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await UserModel.findByIdAndUpdate(
    id,
    {
      ...payload,
      ...(payload.password && {
        password: await bcrypt.hash(
          payload.password,
          Number(config.bcrypt_salt_rounds),
        ),
      }),
    },
    {
      new: true,
    },
  ).lean();

  if (!updateDoc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update user");
  }

  return {
    data: updateDoc,
  };
};

// get all users
const getAllUsersFromDB = async (query: FilterQuery<IUser>): Promise<any> => {
  const builder = new QueryBuilder<IUser>(UserModel.find(), query);

  const usersQuery = builder
    .search(["name", "email"])
    .filter()
    .sort(["-createdAt"])
    .paginate()
    .fields();

  const [data, meta] = await Promise.all([
    usersQuery.modelQuery.lean().exec(),
    builder.getPaginationInfo(),
  ]);

  return { data, meta };
};

const getUserFromDB = async (id: string): Promise<Partial<IUser>> => {
  const user = await UserModel.findById(id).lean();
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return user;
};

// hard delete user
const deleteUserFromDB = async (userId: string): Promise<any> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const deleteUser = await UserModel.findByIdAndDelete(userId);

  return {
    message: "User deleted successfully",
    data: deleteUser,
  };
};

// active or block user
const activeBlockUserFromDB = async (userId: string): Promise<any> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  user.isActive = !user.isActive;
  await user.save();

  return {
    data: user,
    message: user.isActive
      ? "User activated successfully"
      : "User blocked successfully",
  };
};

export const UserService = {
  createUserToDB,
  retrieveProfileFromDB,
  updateUserProfileToDB,
  getAllUsersFromDB,
  deleteUserFromDB,
  activeBlockUserFromDB,
  getUserFromDB,
};
