import express from "express";
import controller from "../controllers/user.controller.js";

const router = express.Router();

router.post("/createuser", controller.createUser);
router.get("/userlist", controller.getUserList);

export default router;
