import express from "express";
import controller from "../controllers/product.controller.js";

const router = express.Router();

router.post("/createproduct", controller.createProduct);
router.get("/productlist", controller.getProductList);
router.get("/productdetails", controller.productDetail);

export default router;
