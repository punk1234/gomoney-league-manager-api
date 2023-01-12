import { Inject, Service } from "typedi";
import { Controller } from "../decorators";
import { Request, Response } from "express";
import { ResponseHandler } from "../helpers";
import { CreateFixtureDto, FixtureStatus, UpdateFixtureDto } from "../models";
import { FixtureService } from "../services/fixture.service";
import config from "../config";

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

  /**
   * @method updateFixture
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async updateFixture(req: Request, res: Response) {
    const FIXTURE = await this.fixtureService.updateFixture(
      req.params.fixtureId,
      req.body as UpdateFixtureDto,
      req.auth?.userId as string,
    );

    ResponseHandler.ok(res, FIXTURE);
  }

  /**
   * @method getFixture
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getFixture(req: Request, res: Response) {
    const FIXTURE = await this.fixtureService.getFixture(req.params.fixtureId);

    ResponseHandler.ok(res, FIXTURE);
  }

  /**
   * @method getFixtures
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getFixtures(req: Request, res: Response) {
    const FIXTURES = await this.fixtureService.getFixtures(req.query);

    ResponseHandler.ok(res, FIXTURES);
  }

  /**
   * @method getFixturesByStatus
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getFixturesByStatus(req: Request, res: Response) {
    const FIXTURES = await this.fixtureService.getFixturesByStatus(
      req.params.fixtureStatus as FixtureStatus,
      req.query as any,
    );

    ResponseHandler.ok(res, FIXTURES);
  }

  /**
   * @method getPublicFixtures
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getPublicFixtures(req: Request, res: Response) {
    const FIXTURES = await this.fixtureService.getPublicFixtures(req.query as any);

    ResponseHandler.ok(res, { records: FIXTURES });
  }

  /**
   * @method removeFixture
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async removeFixture(req: Request, res: Response) {
    await this.fixtureService.removeFixture(req.params.fixtureId);

    ResponseHandler.ok(res, { success: true });
  }

  /**
   * @method generateFixtureUniqueLink
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async generateFixtureUniqueLink(req: Request, res: Response) {
    const FIXTURE_LINK_CODE = await this.fixtureService.generateFixtureUniqueLinkCode(req.params.fixtureId);

    ResponseHandler.ok(res, { link: `${config.FIXTURE_LINK_BASE_URL}/${FIXTURE_LINK_CODE}` });
  }
}
