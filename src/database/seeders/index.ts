import seedUserTeamsFixtures from "./user-team-fixture.seeder";

/**
 * @function runDbSeeders
 * @async
 * @returns {Promise<void>}
 */
export async function runDbSeeders(): Promise<void> {
  await seedUserTeamsFixtures();
}
