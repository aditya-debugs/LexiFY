import express from "express";
import { protectRoutes } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const routes = express.Router();

routes.get("/token",protectRoutes,getStreamToken)

export default routes;