import { Router } from "express";
import { getUserInfo, login, SignUp, updateProfile,
    addProfileImage, removeProfileImage,logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer"
const  upload = multer({
    dest:"uploads/profiles/"
})

const authRoutes = Router();

authRoutes.post("/signup", SignUp)
authRoutes.post("/login", login)
authRoutes.get("/user-info", verifyToken, getUserInfo )
authRoutes.post("/update-profile", verifyToken, updateProfile)
authRoutes.post("/add-profile-image", verifyToken, upload.single("profile-image"),addProfileImage)
authRoutes.post('/logout', logout)

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage)

export default authRoutes;