import {Router} from "express"
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer"
import path from "path"
const messagesRoutes = Router();
const upload = multer({
    dest: path.join("/tmp", "files")
})
messagesRoutes.post("/get-messages", verifyToken, getMessages)

messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile)

export default messagesRoutes