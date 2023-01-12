import C from "../constants";
import { Service } from "typedi";
import { ClientSession } from "mongoose";
import { IPaginatedData } from "../interfaces";
import { ITeam } from "../database/types/team.type";
import TeamModel from "../database/models/team.model";
import { CreateTeamDto, UpdateTeamDto } from "../models";
import { BadRequestError, ConflictError, NotFoundError, ServerError } from "../exceptions";

@Service()
export class TeamService {
  /**
   * @method createTeam
   * @async
   * @param {CreateTeamDto} data
   * @param {string} actionBy
   * @returns {Promise<ITeam>}
   */
  async createTeam(data: CreateTeamDto, actionBy: string): Promise<ITeam> {
    if ((data.name = data.name.trim()) && !data.name) {
      throw new BadRequestError("Invalid value for team-name!");
    }

    await this.checkThatTeamDoesNotExist(data.name, data.code);

    const TEAM = new TeamModel({ ...data, createdBy: actionBy });
    return TEAM.save();
  }

  /**
   * @method updateTeam
   * @async
   * @param {string} teamId
   * @param {UpdateTeamDto} data
   * @param {string} actionBy
   * @returns {Promise<ITeam>}
   */
  async updateTeam(teamId: string, data: UpdateTeamDto, actionBy: string): Promise<ITeam> {
    await this.checkThatTeamExist(teamId);
    await this.checkThatTeamCanBeUpdated(teamId, data);

    const UPDATED_TEAM = await TeamModel.findOneAndUpdate(
      { _id: teamId },
      { ...data, updatedBy: actionBy },
      { new: true },
    );

    if (UPDATED_TEAM) {
      return UPDATED_TEAM;
    }

    throw new ServerError(C.ResponseMessage.ERR_SERVER);
  }

  /**
   * @method getTeam
   * @async
   * @param {string} teamId
   * @returns {Promise<ITeam>}
   */
  async getTeam(teamId: string): Promise<ITeam> {
    return this.checkThatTeamExist(teamId);
  }

  /**
   * @method getTeamList
   * @async
   * @param {Record<string, any>} filter
   * @returns {Promise<IPaginatedData<ITeam>>}
   */
  async getTeamList(filter: Record<string, any>): Promise<IPaginatedData<ITeam>> {
    const { searchValue, page = 1, limit } = filter;

    if (searchValue) {
      const SEARCH_VALUE_FILTER_REGEX = new RegExp(`^${searchValue}`, "i");

      filter = {
        $or: [{ name: SEARCH_VALUE_FILTER_REGEX }, { code: SEARCH_VALUE_FILTER_REGEX }],
      };
    }

    return TeamModel.find(filter).paginate({ limit, page });
  }

  /**
   * @method removeTeam
   * @async
   * @param {string} teamId
   * @param {ClientSession} dbSession
   * @returns {Promise<void>}
   */
  async removeTeam(teamId: string, dbSession?: ClientSession): Promise<void> {
    const DELETION_RESULT = await TeamModel.deleteOne({ _id: teamId }, { session: dbSession });

    if (!DELETION_RESULT.deletedCount) {
      throw new NotFoundError("Team not found!");
    }
  }

  /**
   * @method checkThatTeamExist
   * @async
   * @param {string} teamId
   * @returns {Promise<ITeam>}
   */
  async checkThatTeamExist(teamId: string): Promise<ITeam> {
    const TEAM = await TeamModel.findById(teamId);

    if (TEAM) {
      return TEAM;
    }

    throw new NotFoundError("Team not found!");
  }

  /**
   * @method checkThatTeamsExist
   * @async
   * @param {Array<string>} teamIds
   * @returns {Promise<Array<ITeam>>}
   */
  async checkThatTeamsExist(teamIds: Array<string>): Promise<Array<ITeam>> {
    const FOUND_TEAMS = await TeamModel.find({ _id: { $in: teamIds } });

    if (FOUND_TEAMS.length < teamIds.length) {
      throw new NotFoundError("One or both teams does not exist!");
    }

    return FOUND_TEAMS;
  }

  /**
   * @method checkThatTeamDoesNotExist
   * @async
   * @param {string} name
   * @param {string} code
   */
  private async checkThatTeamDoesNotExist(name: string, code: string): Promise<void> {
    // CONFIRM IF ORDER OF PROPERTIES MATTER HERE TO USE INDEX PROPERLY - SHOULD CODE COME FIRST
    const FOUND_TEAM = await TeamModel.findOne({
      $or: [{ name: new RegExp(`^${name}$`, "i") }, { code }],
    });

    if (FOUND_TEAM) {
      throw new ConflictError(`Team ${FOUND_TEAM.code == code ? "code" : "name"} already exist!`);
    }
  }

  /**
   * @method checkThatTeamCanBeUpdated
   * @async
   * @param {string} teamId
   * @param {UpdateTeamDto} data
   */
  private async checkThatTeamCanBeUpdated(teamId: string, data: UpdateTeamDto): Promise<void> {
    const FILTERS: Array<Record<string, any>> = [];

    if ((data.name = data.name?.trim()) && !data.name?.length) {
      throw new BadRequestError("Invalid value for team-name!");
    } else if (data.name) {
      FILTERS.push({ name: new RegExp(`^${data.name}$`, "i") });
    }

    if (data.code) {
      FILTERS.push({ code: data.code });
    }

    if (!FILTERS.length) {
      return;
    }

    const FOUND_TEAMS = await TeamModel.find({ $or: FILTERS });

    if (
      FOUND_TEAMS.length > 1 ||
      (FOUND_TEAMS.length == 1 && FOUND_TEAMS[0]._id.toString() !== teamId)
    ) {
      throw new ConflictError("Team already exist!");
    }
  }
}
