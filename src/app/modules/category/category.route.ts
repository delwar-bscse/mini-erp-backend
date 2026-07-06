import express from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
const router = express.Router();

router
  .route("/")
  .get(CategoryController.getCategories)
  .post(
    auth(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
    validateRequest(CategoryValidation.createCategoryZodSchema),
    CategoryController.createCategory,
  );

router
  .route("/:id")
  .get(CategoryController.getCategory)
  .delete(
    auth(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
    CategoryController.deleteCategory,
  )
  .patch(
    auth(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
    validateRequest(CategoryValidation.updateCategoryZodSchema),
    CategoryController.updateCategory,
  );

export const CategoryRoutes = router;
