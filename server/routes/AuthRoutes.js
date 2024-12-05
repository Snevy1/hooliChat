import { Router } from "express";
import { login, SignUp } from "../controllers/AuthController.js";

const authRoutes = Router();

authRoutes.post("/signup", SignUp)
authRoutes.post("/login", login)

export default authRoutes;