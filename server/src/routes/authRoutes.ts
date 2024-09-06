import express from "express";
import { register, login, check } from "@/controllers/authController";
import { authMiddleware } from "@/middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check", authMiddleware, check);

export default router;
