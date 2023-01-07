import express from "express";
import { Container } from "typedi";
import { requireAuth } from "../middlewares";
import { FixtureController } from "../controllers/fixture.controller";

const router = express.Router();
const controller = Container.get(FixtureController);

router.post("/", requireAuth(true), controller.createFixture);

router.get("/:fixtureId", requireAuth(true), controller.getFixture);
router.patch("/:fixtureId", requireAuth(true), controller.updateFixture);
router.delete("/:fixtureId", requireAuth(true), controller.removeFixture);

export default router;
