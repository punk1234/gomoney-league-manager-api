import express from "express";
import { Container } from "typedi";
import { requireAuth } from "../middlewares";
import { FixtureController } from "../controllers/fixture.controller";

const router = express.Router();
const controller = Container.get(FixtureController);

router.post("/", requireAuth(true), controller.createFixture);

export default router;
