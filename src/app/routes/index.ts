import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.routes";
import { OrderRoutes } from "../modules/order/product.routes";
const router = express.Router();

const apiRoutes = [
  { path: "/user", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/category", route: CategoryRoutes },
  { path: "/product", route: ProductRoutes },
  { path: "/order", route: OrderRoutes },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
