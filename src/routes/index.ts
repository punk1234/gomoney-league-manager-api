import path from "path";
import { Application } from "express";
import rootRouter from "./root.route";
import authRouter from "./auth.route";
import teamRouter from "./team.route";
import publicRouter from "./public.route";
import fixtureRouter from "./fixture.route";
import { apiRequestValidator, notFoundHandler } from "../middlewares";

const API_SPEC_PATH: string = path.resolve(__dirname, "../../spec/api-spec.yml");

/**
 * @class RouteManager
 * @classdesc
 */
export default class RouteManager {
  /**
   * @method installRoutes
   * @static
   * @param {Application} app
   */
  static installRoutes(app: Application): void {
    app.use(rootRouter);
    app.use(apiRequestValidator(API_SPEC_PATH));
    app.use("/public", publicRouter);
    app.use("/auth", authRouter);
    app.use("/teams", teamRouter);
    app.use("/fixtures", fixtureRouter);
    app.use(notFoundHandler);
  }
}
