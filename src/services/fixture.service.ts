import { Inject, Service } from "typedi";
import { CreateFixtureDto } from "../models";
import { TeamService } from "./team.service";
import { IFixture } from "../database/types/fixture.type";
import FixtureModel from "../database/models/fixture.model";
import { ConflictError, NotFoundError, UnprocessableError } from "../exceptions";

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
   * @method getFixture
   * @async
   * @param {string} fixtureId
   * @returns {Promise<IFixture>}
   */
  async getFixture(fixtureId: string): Promise<IFixture> {
    return this.checkThatFixtureExist(fixtureId);
  }

  /**
   * @method removeFixture
   * @async
   * @param {string} fixtureId
   * @returns {Promise<void>}
   */
  async removeFixture(fixtureId: string): Promise<void> {
    const DELETION_RESULT = await FixtureModel.deleteOne({ _id: fixtureId });

    if(!DELETION_RESULT.deletedCount) {
      throw new NotFoundError("Fixture not found!");
    }
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
}
