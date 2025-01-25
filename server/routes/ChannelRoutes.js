import {Router}  from "express"

import {verifyToken} from "../middlewares/AuthMiddleware.js"
import { createOrUpdateChannel, getChannelMessages, getUserChannels } from "../controllers/ChannelControllers.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createOrUpdateChannel);
channelRoutes.get("/get-user-channels", verifyToken,getUserChannels );

channelRoutes.get("/get-channel-mesages/:channelId", verifyToken, getChannelMessages)

export default channelRoutes;

