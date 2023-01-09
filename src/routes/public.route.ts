import express from "express";
import { Container } from "typedi";
import { FixtureController } from "../controllers/fixture.controller";

const router = express.Router();
const controller = Container.get(FixtureController);

router.get("/fixtures", controller.getPublicFixtures);

export default router;
