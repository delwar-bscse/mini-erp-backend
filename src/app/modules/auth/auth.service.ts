import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import { emailHelper } from "../../../helpers/emailHelper";
import { jwtHelper } from "../../../helpers/jwtHelper";
import { emailTemplate } from "../../../shared/emailTemplate";
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from "../../../types/auth";
import cryptoToken from "../../../util/cryptoToken";
import generateOTP from "../../../util/generateOTP";
import { ResetToken } from "../resetToken/resetToken.model";
import { UserModel } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password, role } = payload;

  const isExistUser: any = await UserModel.findOne({ email }).select(
    "+password",
  );
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.isActive) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "This user is inactive! Please contact to admin",
    );
  }

  //check match password
  if (
    password &&
    !(await UserModel.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect!");
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  //create token
  const refreshToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwtRefreshSecret as Secret,
    config.jwt.jwtRefreshExpiresIn as string,
  );

  return {
    accessToken,
    refreshToken,
    role: isExistUser.role,
    _id: isExistUser._id,
  };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await UserModel.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };

  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await UserModel.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail): Promise<any> => {
  const superAdmin = await UserModel.findOne({ role: USER_ROLES.ADMIN });

  const { email, oneTimeCode } = payload;
  const isExistUser = await UserModel.findOne({ email }).select(
    "+authentication",
  );
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please give the otp, check your email we send a code",
    );
  }

  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You provided wrong otp");
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Otp already expired, Please try again",
    );
  }

  await UserModel.findOneAndUpdate(
    { _id: isExistUser._id },
    {
      authentication: {
        isResetPassword: true,
        oneTimeCode: null,
        expireAt: null,
      },
    },
  );

  //create token ;
  const createToken = cryptoToken();
  await ResetToken.create({
    user: isExistUser._id,
    token: createToken,
    expireAt: new Date(Date.now() + 5 * 60000),
  });

  return {
    data: { token: createToken },
    message:
      "Verification Successful: Please securely store and utilize this code for reset password",
  };
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword,
) => {
  const { newPassword, confirmPassword } = payload;

  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  //user permission check
  const isExistUser = await UserModel.findById(isExistToken.user).select(
    "+authentication",
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'",
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Token expired, Please click again to the forget password",
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!",
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await UserModel.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

//change password
const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword,
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await UserModel.findById(user.id).select("+password");
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await UserModel.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password is incorrect");
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Please give different password from current password",
    );
  }

  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched",
    );
  }

  isExistUser.set({ password: newPassword });
  await isExistUser.save();
};

//new access token
const newAccessTokenToUser = async (token: string) => {
  // Check if the token is provided
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Token is required!");
  }

  const verifyUser = jwtHelper.verifyToken(
    token,
    config.jwt.jwtRefreshSecret as Secret,
  );

  const isExistUser = await UserModel.findById(verifyUser?.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized access");
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string,
  );

  return { accessToken, role: isExistUser.role };
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  newAccessTokenToUser,
};
