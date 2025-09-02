import express from "express";
import controller from "../controllers/product.controller.js";
import requireUser from "../middleware/requireUser.middleware.js";

const router = express.Router();

router.post("/createproduct", controller.createProduct);
router.get("/productlist", requireUser, controller.getProductList);
router.get("/productdetails", requireUser, controller.productDetail);

export default router;
