import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";

// verify email
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyEmailToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result.data,
  });
});

// login user
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUserFromDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User login successfully",
    data: result,
  });
});

// forget password
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPasswordToDB(req.body.email);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Please check your email, we send a OTP!",
    data: result,
  });
});

// reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPasswordToDB(
    req.headers.authorization!,
    req.body,
  );
  console.log("Token: ", req.headers.authorization);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password reset successfully",
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePasswordToDB(req.user, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Password changed successfully",
  });
});

// new access token
const newAccessToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.newAccessTokenToUser(req.body.refreshToken);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Generate Access Token successfully",
    data: result,
  });
});

export const AuthController = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  newAccessToken,
};
