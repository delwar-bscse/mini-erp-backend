import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { OrderController } from "./order.controller";
import { OrderValidation } from "./order.validation";
const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    OrderController.getAllOrders,
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    validateRequest(OrderValidation.createOrderZodValidationSchema),
    OrderController.createOrder,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    OrderController.getSingleOrder,
  );

export const OrderRoutes = router;
