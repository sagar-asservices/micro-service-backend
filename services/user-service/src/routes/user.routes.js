import express from "express";
import controller from "../controllers/user.controller.js";
import requireUser from "../middleware/requireUser.middleware.js";

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/verifyuser", controller.verifyUser);
router.get("/profile", controller.profile);
router.get("/userlist", requireUser, controller.getUserList);

export default router;
