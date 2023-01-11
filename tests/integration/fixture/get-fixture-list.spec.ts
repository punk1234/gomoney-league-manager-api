import Container from "typedi";
import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import { LoginResponse } from "../../../src/models";
import AppFactory from "../../__helpers__/app-factory.helper";
import { UserService } from "../../../src/services/user.service";
import { AuthService } from "../../../src/services/auth.service";
import { TeamService } from "../../../src/services/team.service";
import { ITeam } from "../../../src/database/types/team.type";
import { FixtureService } from "../../../src/services/fixture.service";
import { IFixture } from "../../../src/database/types/fixture.type";

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);
const TEAM_SERVICE = Container.get(TeamService);
const FIXTURE_SERVICE = Container.get(FixtureService);

let app: Application;
let userLoginInfo: LoginResponse, adminLoginInfo: LoginResponse;
let teams: Array<ITeam>;
let createdFixtures: Array<IFixture>;

describe("GET /fixtures", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });

    const TEAMS = [
      { name: "aBAB", code: "AB1" },
      { name: "BBAA", code: "BA2" },
      { name: "BBCC", code: "BC3" },
      { name: "ABAa", code: "AA4" },
      { name: "AbAD", code: "DA5" },
    ];

    teams = await Promise.all(
      TEAMS.map((team: any) => TEAM_SERVICE.createTeam(team, adminLoginInfo.user.id)),
    );

    const FIXTURE_DATE = new Date(Date.now() + 3_600_000); // next 1hr
    const FIXTURES = [
      { homeTeamId: teams[0]._id, awayTeamId: teams[1]._id, commencesAt: FIXTURE_DATE },
      { homeTeamId: teams[0]._id, awayTeamId: teams[4]._id, commencesAt: FIXTURE_DATE },
      { homeTeamId: teams[1]._id, awayTeamId: teams[2]._id, commencesAt: FIXTURE_DATE },
      { homeTeamId: teams[2]._id, awayTeamId: teams[3]._id, commencesAt: FIXTURE_DATE },
      { homeTeamId: teams[3]._id, awayTeamId: teams[2]._id, commencesAt: FIXTURE_DATE },
    ];

    createdFixtures = await Promise.all(
      FIXTURES.map((item: any) => FIXTURE_SERVICE.createFixture(item, adminLoginInfo.user.id)),
    );
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - Get fixtures with valid data", async () => {
    const FILTER_DATE = createdFixtures[0].commencesAt.toISOString().slice(0, 10);

    const res = await request(app)
      .get(`/fixtures?searchValue=aBA&fixtureStatus=PENDING&date=${FILTER_DATE}&limit=7`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.SUCCESS);

    const VALID_FIXTURE_IDS = [
      createdFixtures[0]._id.toString(),
      createdFixtures[1]._id.toString(),
      createdFixtures[3]._id.toString(),
      createdFixtures[4]._id.toString(),
    ];

    expect(res.body.records).toHaveLength(4);
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("size", 4);
    expect(res.body).toHaveProperty("limit", 7);

    expect(VALID_FIXTURE_IDS.includes(res.body.records[0].id)).toEqual(true);
    expect(VALID_FIXTURE_IDS.includes(res.body.records[1].id)).toEqual(true);
    expect(VALID_FIXTURE_IDS.includes(res.body.records[2].id)).toEqual(true);
    expect(VALID_FIXTURE_IDS.includes(res.body.records[3].id)).toEqual(true);
  });

  it("[400] - Get fixtures with invalid query filter", async () => {
    const res = await request(app)
      .get(`/teams?&fixtureStatus=`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(1);
    expect(res.body.data.errors[0].path).toEqual("/query/fixtureStatus");
  });

  it("[401] - Get fixtures with missing token", async () => {
    const res = await request(app).get(`/fixtures`).expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Get fixture without being an admin", async () => {
    const res = await request(app)
      .get("/fixtures")
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });
});
