import express from "express";
import controller from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/profile", controller.profile);
router.get("/userlist", controller.getUserList);

export default router;
