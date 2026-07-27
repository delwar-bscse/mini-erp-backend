import express, { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.createLoginZodSchema),
  AuthController.loginUser,
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword,
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.createForgetPasswordZodSchema),
  AuthController.forgetPassword,
);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.createVerifyEmailZodSchema),
  AuthController.verifyEmail,
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.createResetPasswordZodSchema),
  AuthController.resetPassword,
);

router.post(
  "/change-password",
  auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
  validateRequest(AuthValidation.createChangePasswordZodSchema),
  AuthController.changePassword,
);

router.post("/refresh-token", AuthController.newAccessToken);

export const AuthRoutes = router;
