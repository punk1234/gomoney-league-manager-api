import express from "express";
import { Container } from "typedi";
import { TeamController } from "../controllers/team.controller";
import { requireAuth } from "../middlewares";

const router = express.Router();
const controller = Container.get(TeamController);

router.get("/", requireAuth(), controller.getTeamList);
router.post("/", requireAuth(true), controller.createTeam);

router.get("/:teamId", requireAuth(true), controller.getTeam);
router.patch("/:teamId", requireAuth(true), controller.updateTeam);
router.delete("/:teamId", requireAuth(true), controller.deleteTeam);

export default router;
