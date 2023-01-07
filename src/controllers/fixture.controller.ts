import { Inject, Service } from "typedi";
import { Controller } from "../decorators";
import { Request, Response } from "express";
import { ResponseHandler } from "../helpers";
import { CreateFixtureDto } from "../models";
import { FixtureService } from "../services/fixture.service";

@Service()
@Controller()
export class FixtureController {
  // eslint-disable-next-line no-useless-constructor
  constructor(@Inject() private readonly fixtureService: FixtureService) {}

  /**
   * @method createFixture
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async createFixture(req: Request, res: Response) {
    const FIXTURE = await this.fixtureService.createFixture(
      req.body as CreateFixtureDto,
      req.auth?.userId as string,
    );

    ResponseHandler.created(res, FIXTURE);
  }

}