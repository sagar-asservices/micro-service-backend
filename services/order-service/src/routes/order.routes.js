import express from "express";
import controller from "../controllers/order.controller.js";

const router = express.Router();

router.post("/createorder", controller.createOrder);
router.get("/myorder", controller.myOrderList);

export default router;
