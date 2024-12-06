import { Router } from "express";
import { getUserInfo, login, SignUp } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.post("/signup", SignUp)
authRoutes.post("/login", login)
authRoutes.get("/user-info", verifyToken, getUserInfo )

export default authRoutes;