import { Logger } from "../../helpers";
import { ITeam } from "../types/team.type";
import TeamModel from "../models/team.model";
import UserModel from "../models/user.model";
import { TEAMS_DATA, USERS_DATA } from "./data";
import FixtureModel from "../models/fixture.model";
import { CreateFixtureDto, CreateTeamDto, RegisterUserDto } from "../../models";

/**
 * @function anyUserExist
 * @returns {Promise<boolean>}
 */
const anyUserExist = async (): Promise<boolean> => {
  const USER = await UserModel.findOne();
  return !!USER;
};

/******************************************************
 ************** FIXTURES DATA GENERATOR ***************
 ******************************************************/

/**
 * @function getFixturesData
 * @param {Array<ITeam>} teams
 * @returns {Array<CreateFixtureDto>}
 */
const getFixturesData = (teams: Array<ITeam>): Array<CreateFixtureDto> => {
  const MAX_HOME_MATCH_PER_TEAM = 3;
  const FIXTURES: Array<CreateFixtureDto> = [];

  for (let teamIndex = 0; teamIndex < teams.length - MAX_HOME_MATCH_PER_TEAM; teamIndex++) {
    for (
      let awayTeamIndex = teamIndex + 1;
      awayTeamIndex <= teamIndex + MAX_HOME_MATCH_PER_TEAM;
      awayTeamIndex++
    ) {
      FIXTURES.push({
        homeTeamId: teams[teamIndex]._id.toString(),
        awayTeamId: teams[awayTeamIndex]._id.toString(),
        commencesAt: new Date(Date.now() + 3_600_000), // next 1hr
      });
    }
  }

  return FIXTURES;
};

/**
 * @function seedUsers
 * @param {Array<RegisterUserDto>} data
 */
const seedUsers = async (data: Array<RegisterUserDto>) => {
  await UserModel.bulkSave(data.map((item: RegisterUserDto) => new UserModel(item)));

  Logger.info("Users have been seeded successfully!!");
};

/******************************************************
 ******************** TEAMS SEEDER ********************
 ******************************************************/

/**
 * @method seedTeams
 * @async
 * @param {Array<CreateTeamDto>} data
 * @returns {Promise<Array<ITeam>>}
 */
const seedTeams = async (data: Array<CreateTeamDto>): Promise<Array<ITeam>> => {
  await TeamModel.bulkSave(data.map((item: CreateTeamDto) => new TeamModel(item)));
  Logger.info("Teams have been seeded successfully!!");

  return TeamModel.find().limit(data.length);
};

/******************************************************
 ****************** FIXTURES SEEDER *******************
 ******************************************************/

/**
 * @function seedFixtures
 * @async
 * @param {Array<CreateFixtureDto>} data
 */
const seedFixtures = async (data: Array<CreateFixtureDto>) => {
  await TeamModel.bulkSave(data.map((item: CreateFixtureDto) => new FixtureModel(item)));

  Logger.info("Fixtures have been seeded successfully!!");
};

/******************************************************
 ******************** MAIN SEEDER *********************
 ******************************************************/

// NOTE: CAN USE DB TRANSACTIONS HERE TO MAKE SEEDING ATOMIC
export default async function main(): Promise<void> {
  try {
    if (await anyUserExist()) {
      Logger.info("SKIPPING >> SEEDING FOR USERS, TEAMS & FIXTURES");
      return;
    }

    Logger.info("READY TO SEED DATABASE WITH DATA!");
    await seedUsers(USERS_DATA);

    const TEAMS: Array<ITeam> = await seedTeams(TEAMS_DATA);
    const FIXTURES_DATA = getFixturesData(TEAMS);

    await seedFixtures(FIXTURES_DATA);

    Logger.info("SEEDING COMPLETED SUCCESSFULLY!");
  } catch (err: any) {
      
    Logger.error(`[SEEDING FAILED]: ${err.message}`);
    process.exit(1);
  }
}
