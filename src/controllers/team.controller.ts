import { Inject, Service } from "typedi";
import { Controller } from "../decorators";
import { Request, Response } from "express";
import { ResponseHandler } from "../helpers";
import { CreateTeamDto, UpdateTeamDto } from "../models";
import { TeamService } from "../services/team.service";

@Service()
@Controller()
export class TeamController {
  // eslint-disable-next-line no-useless-constructor
  constructor(@Inject() private readonly teamService: TeamService) {}

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
}
