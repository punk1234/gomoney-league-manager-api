import C from "../constants";
import express from "express";
import { Container } from "typedi";
import { AuthController } from "../controllers/auth.controller";
import { userRateLimiter } from "../middlewares";

const router = express.Router();
const controller = Container.get(AuthController);

router.post("/register", controller.register);

// TODO: IMPLEMENT & ADD RATE-LIMIT MIDDLEWARE
router.post("/login", userRateLimiter(C.ApiRateLimiterType.AUTH_LOGIN), controller.login);

export default router;
