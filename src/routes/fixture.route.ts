import express from "express";
import { Container } from "typedi";
import { requireAuth } from "../middlewares";
import { FixtureController } from "../controllers/fixture.controller";

const router = express.Router();
const controller = Container.get(FixtureController);

router.get("/", requireAuth(true), controller.getFixtures);
router.post("/", requireAuth(true), controller.createFixture);

router.get("/by-status/:fixtureStatus", requireAuth(false), controller.getFixturesByStatus);

router.get("/:fixtureId", requireAuth(true), controller.getFixture);
router.patch("/:fixtureId", requireAuth(true), controller.updateFixture);
router.delete("/:fixtureId", requireAuth(true), controller.removeFixture);

router.post("/:fixtureId/generate-link", requireAuth(true), controller.generateFixtureUniqueLink);

export default router;
