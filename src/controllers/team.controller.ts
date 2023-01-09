import { ClientSession } from "mongoose";
import { Inject, Service } from "typedi";
import { Controller } from "../decorators";
import { Request, Response } from "express";
import { CreateTeamDto, UpdateTeamDto } from "../models";
import { TeamService } from "../services/team.service";
import { FixtureService } from "../services/fixture.service";
import { DbTransactionHelper, ResponseHandler } from "../helpers";

@Service()
@Controller()
export class TeamController {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    @Inject() private readonly teamService: TeamService,
    @Inject() private readonly fixtureService: FixtureService,
  ) {}

  /**
   * @method createTeam
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async createTeam(req: Request, res: Response) {
    const TEAM = await this.teamService.createTeam(
      req.body as CreateTeamDto,
      req.auth?.userId as string,
    );

    ResponseHandler.created(res, TEAM);
  }

  /**
   * @method updateTeam
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async updateTeam(req: Request, res: Response) {
    const TEAM = await this.teamService.updateTeam(
      req.params.teamId,
      req.body as UpdateTeamDto,
      req.auth?.userId as string,
    );

    ResponseHandler.ok(res, TEAM);
  }

  /**
   * @method getTeam
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getTeam(req: Request, res: Response) {
    const TEAM = await this.teamService.getTeam(req.params.teamId);

    ResponseHandler.ok(res, TEAM);
  }

  /**
   * @method getTeamList
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async getTeamList(req: Request, res: Response) {
    const TEAMS = await this.teamService.getTeamList(req.query);

    ResponseHandler.ok(res, TEAMS);
  }

  /**
   * @method getTeam
   * @async
   * @param {Request} req
   * @param {Response} res
   */
  async deleteTeam(req: Request, res: Response) {
    const { teamId } = req.params;

    await this.teamService.checkThatTeamExist(teamId);

    DbTransactionHelper.execute(async (dbSession?: ClientSession): Promise<void> => {
      await this.fixtureService.removeFixturesByTeamId(teamId, dbSession);

      await this.teamService.removeTeam(req.params.teamId, dbSession);
    });

    ResponseHandler.ok(res, { success: true });
  }
}
