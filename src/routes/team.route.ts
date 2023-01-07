import express from "express";
import { Container } from "typedi";
import { TeamController } from "../controllers/team.controller";
import { requireAuth } from "../middlewares";

const router = express.Router();
const controller = Container.get(TeamController);

router.post("/", requireAuth(true), controller.createTeam);

export default router;
