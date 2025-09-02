import express from "express";
import controller from "../controllers/order.controller.js";
import requireUser from "../middleware/requireUser.middleware.js";

const router = express.Router();

router.post("/createorder", requireUser, controller.createOrder);
router.get("/myorder", requireUser, controller.myOrderList);

export default router;
