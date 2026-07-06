import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import { ProductValidation } from "./product.validation";
import { ProductController } from "./product.controller";
const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    ProductController.getAllProducts,
  )
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //   console.log("Files : ", req.files);
        const image = await getSingleFilePath(req.files, "image");
        const payload = JSON.parse(req.body.data);

        req.body = {
          ...payload,
          ...(image && { image }),
        };
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Process Create Product" });
      }
    },
    validateRequest(ProductValidation.createProductZodValidationSchema),
    ProductController.createProduct,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    ProductController.getSingleProduct,
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //   console.log("Files : ", req.files);
        const image = await getSingleFilePath(req.files, "image");
        const payload = JSON.parse(req.body.data);

        req.body = {
          ...payload,
          ...(image && { image }),
        };
        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to Process Update Product" });
      }
    },
    validateRequest(ProductValidation.updateProductZodValidationSchema),
    ProductController.updateProduct,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    ProductController.deleteProduct,
  );

export const ProductRoutes = router;
