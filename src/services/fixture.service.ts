import C from "../constants";
import { Inject, Service } from "typedi";
import { ClientSession } from "mongoose";
import { TeamService } from "./team.service";
import { IFixture } from "../database/types/fixture.type";
import FixtureModel from "../database/models/fixture.model";
import { IPaginatedData, IPaginationOption } from "../interfaces";
import { CreateFixtureDto, FixtureStatus, UpdateFixtureDto } from "../models";
import { ConflictError, NotFoundError, ServerError, UnprocessableError } from "../exceptions";
import { getPaginationSummary } from "../helpers";

@Service()
export class FixtureService {
  // eslint-disable-next-line no-useless-constructor
  constructor(@Inject() private readonly teamService: TeamService) {}

  /**
   * @method createFixture
   * @async
   * @param {CreateFixtureDto} data
   * @param {string} actionBy
   * @returns {Promise<IFixture>}
   */
  async createFixture(data: CreateFixtureDto, actionBy: string): Promise<IFixture> {
    if (data.homeTeamId === data.awayTeamId) {
      throw new ConflictError("Home & away teams cannot be the same!");
    }

    if (new Date(data.commencesAt).getTime() < Date.now()) {
      throw new UnprocessableError("Fixture start-date must be in the future");
    }

    await this.teamService.checkThatTeamsExist([data.homeTeamId, data.awayTeamId]);
    await this.checkThatFixtureDoesNotExist(data.homeTeamId, data.awayTeamId);

    const FIXTURE = new FixtureModel({ ...data, createdBy: actionBy });

    return FIXTURE.save();
  }

  /**
   * @method updateFixture
   * @async
   * @param {UpdateFixtureDto} data
   * @param {string} actionBy
   * @returns {Promise<IFixture>}
   */
  async updateFixture(
    fixtureId: string,
    data: UpdateFixtureDto,
    actionBy: string,
  ): Promise<IFixture> {
    if (data.commencesAt && new Date(data.commencesAt).getTime() < Date.now()) {
      throw new UnprocessableError("Fixture start-date must be in the future");
    }

    const FIXTURE = await this.checkThatFixtureExist(fixtureId);

    let { homeTeamId, awayTeamId } = FIXTURE;
    const FILTERS: Array<string> = [];

    if (data.homeTeamId) {
      FILTERS.push(data.homeTeamId) && (homeTeamId = data.homeTeamId);
    }

    if (data.awayTeamId) {
      FILTERS.push(data.awayTeamId) && (awayTeamId = data.awayTeamId);
    }

    if (homeTeamId == awayTeamId) {
      throw new ConflictError("Home & away teams cannot be the same!");
    }

    if (FILTERS.length) {
      // NOTE: IF WE HAVE 1 ITEM, AND IT DOES NOT EXIST, ERROR MSG MIGHT BE INVALID SAYING `ONE OR MORE...`
      await this.teamService.checkThatTeamsExist(FILTERS);
      await this.checkThatFixtureDoesNotExist(homeTeamId, awayTeamId);
    }

    // TODO: HANDLE MATCH-RESULT UPDATE

    const UPDATED_FIXTURE = await FixtureModel.findOneAndUpdate(
      { _id: fixtureId },
      { ...data, updatedBy: actionBy },
      { new: true },
    );

    if (UPDATED_FIXTURE) {
      return UPDATED_FIXTURE;
    }

    throw new ServerError(C.ResponseMessage.ERR_SERVER);
  }

  /**
   * @method getFixture
   * @async
   * @param {string} fixtureId
   * @returns {Promise<IFixture>}
   */
  async getFixture(fixtureId: string): Promise<IFixture> {
    return this.checkThatFixtureExist(fixtureId);
  }

  /**
   * @method getFixturesByStatus
   * @async
   * @param {FixtureStatus} status
   * @param {IPaginationOption} opts
   * @returns {Promise<IFixture>}
   */
  async getFixturesByStatus(
    status: FixtureStatus,
    opts: IPaginationOption,
  ): Promise<IPaginatedData<IFixture>> {
    opts.page ||= 1;

    const [records, totalItemCount] = await Promise.all([
      this.getFixturesByStatusRecords(status, opts),
      FixtureModel.find({ status }).countDocuments(),
    ]);

    return getPaginationSummary(records, totalItemCount, opts);
  }

  /**
   * @method getPublicFixtures
   * @async
   * @param {Record<string, any>} filter
   * @returns {Promise<IFixture>}
   */
  async getPublicFixtures(filter: Record<string, any>): Promise<Array<IFixture>> {
    return this.getPublicFixtureRecords(filter);
  }

  /**
   * @method removeFixture
   * @async
   * @param {string} fixtureId
   * @returns {Promise<void>}
   */
  async removeFixture(fixtureId: string): Promise<void> {
    const DELETION_RESULT = await FixtureModel.deleteOne({ _id: fixtureId });

    if (!DELETION_RESULT.deletedCount) {
      throw new NotFoundError("Fixture not found!");
    }
  }

  /**
   * @method removeFixturesByTeamId
   * @async
   * @param {string} teamId
   * @param {ClientSession} dbSession
   * @returns {Promise<void>}
   */
  async removeFixturesByTeamId(teamId: string, dbSession?: ClientSession): Promise<void> {
    await FixtureModel.deleteMany(
      {
        $or: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      { session: dbSession },
    );
  }

  /**
   * @method checkThatFixtureDoesNotExist
   * @async
   * @param {string} homeTeamId
   * @param {string} awayTeamId
   */
  private async checkThatFixtureDoesNotExist(
    homeTeamId: string,
    awayTeamId: string,
  ): Promise<void> {
    const FIXTURE = await FixtureModel.findOne({ homeTeamId, awayTeamId });

    if (FIXTURE) {
      throw new ConflictError("Fixture already exist!");
    }
  }

  /**
   * @method checkThatFixtureExist
   * @async
   * @param {string} fixtureId
   * @returns {Promise<IFixture>}
   */
  private async checkThatFixtureExist(fixtureId: string): Promise<IFixture> {
    const FIXTURE = await FixtureModel.findById(fixtureId);

    if (FIXTURE) {
      return FIXTURE;
    }

    throw new NotFoundError("Fixture not found!");
  }

  /**
   * @method getFixturesByStatusRecords
   * @async
   * @param {FixtureStatus} status
   * @param {IPaginationOption} opts
   * @returns {Promise<Array<any>>}
   */
  private async getFixturesByStatusRecords(
    status: FixtureStatus,
    opts: IPaginationOption,
  ): Promise<Array<any>> {
    const LOOKUP_DATA = { from: "teams", foreignField: "_id" };

    return FixtureModel.aggregate([
      { $match: { status } },
      { $sort: { commencesAt: 1 } },
      { $skip: (Number(opts.page) - 1) * Number(opts.limit) },
      { $limit: Number(opts.limit) },

      { $lookup: { ...LOOKUP_DATA, localField: "homeTeamId", as: "homeTeam" } },
      { $lookup: { ...LOOKUP_DATA, localField: "awayTeamId", as: "awayTeam" } },

      {
        $project: {
          _id: 0,
          id: "$_id",
          homeTeam: { $first: "$homeTeam.name" },
          awayTeam: { $first: "$awayTeam.name" },
          status: 1,
          commencesAt: 1,
          matchResult: 1,
          createdAt: 1,
        },
      },
    ]);
  }

  /**
   * @method getPublicFixtureRecords
   * @async
   * @param {Record<string, any>} filter
   * @returns {Promise<Array<any>>}
   */
  private async getPublicFixtureRecords(filter: Record<string, any>): Promise<Array<any>> {
    const { searchValue, fixtureStatus, date = new Date().toISOString().slice(0, 10) } = filter;

    filter = fixtureStatus ? { status: fixtureStatus } : {};
    filter["commencesAt"] = { "$gte": new Date(`${date}T00:00:00.000Z`), "$lte": new Date(`${date}T23:59:59.999Z`) };

    let teamFilter = [];
    
    // TODO: PROBABLY CREATE A METHOD IN TEAM-SERVICE AS THIS LOOKS LIKE A DUPLICATE
    if (searchValue) {
      const SEARCH_VALUE_FILTER_REGEX = new RegExp(`^${searchValue}`, "i");

      teamFilter.push({
        $match: {
            $or: [
                { "homeTeam.name": SEARCH_VALUE_FILTER_REGEX },
                { "homeTeam.code": SEARCH_VALUE_FILTER_REGEX },
                { "awayTeam.name": SEARCH_VALUE_FILTER_REGEX },
                { "awayTeam.code": SEARCH_VALUE_FILTER_REGEX }
            ]
        }
      });
    }

    const LOOKUP_DATA = { from: "teams", foreignField: "_id" };

    return FixtureModel.aggregate([
      { $match: filter },
      { $sort: { commencesAt: 1 } },

      { $lookup: { ...LOOKUP_DATA, localField: "homeTeamId", as: "homeTeam" } },
      { $lookup: { ...LOOKUP_DATA, localField: "awayTeamId", as: "awayTeam" } },
      ...teamFilter as any,
      {
        $project: {
          _id: 0,
          id: "$_id",
          homeTeam: { $first: "$homeTeam.name" },
          awayTeam: { $first: "$awayTeam.name" },
          status: 1,
          commencesAt: 1,
          matchResult: 1,
          createdAt: 1,
        },
      },
    ]);
  }
}
