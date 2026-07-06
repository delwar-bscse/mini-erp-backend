import express from "express";
import { USER_ROLES } from "../../../enums/user";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    UserController.retrieveProfile,
  )
  .post(
    validateRequest(UserValidation.createUserZodValidationSchema),
    UserController.createUser,
  );

router.get("/users", auth(USER_ROLES.ADMIN), UserController.getAllUsers);
router.get("/users/:id", auth(USER_ROLES.ADMIN), UserController.getUser);

router.patch(
  "/update-user/:id",
  auth(USER_ROLES.ADMIN),
  validateRequest(UserValidation.updateUserZodValidationSchema),
  UserController.updateUserProfile,
);

router.delete(
  "/delete-user/:id",
  auth(USER_ROLES.ADMIN),
  UserController.deleteUser,
);
router.patch(
  "/active-block-user/:id",
  auth(USER_ROLES.ADMIN),
  UserController.activeBlockUser,
);

export const UserRoutes = router;
