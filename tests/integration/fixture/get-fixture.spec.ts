import Container from "typedi";
import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import { FixtureStatus, LoginResponse } from "../../../src/models";
import AppFactory from "../../__helpers__/app-factory.helper";
import { UserService } from "../../../src/services/user.service";
import { AuthService } from "../../../src/services/auth.service";
import { ITeam } from "../../../src/database/types/team.type";
import { TeamService } from "../../../src/services/team.service";
import { FixtureMock } from "../../__mocks__/fixture.mock";
import { TeamMock } from "../../__mocks__/team.mock";
import { FixtureService } from "../../../src/services/fixture.service";

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);
const TEAM_SERVICE = Container.get(TeamService);
const FIXTURE_SERVICE = Container.get(FixtureService);

let app: Application;
let userLoginInfo: LoginResponse, adminLoginInfo: LoginResponse;
let createdTeams: Array<ITeam>;
let existingFixture: any, createdFixture: any;

describe("GET /fixtures/:fixtureId", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });

    const TEAMS = TeamMock.getTeams();
    createdTeams = await Promise.all(TEAMS.map((team) => TEAM_SERVICE.createTeam(team, adminLoginInfo.user.id)));

    createdFixture = await FIXTURE_SERVICE.createFixture({
        homeTeamId: createdTeams[0]._id,
        awayTeamId: createdTeams[1]._id,
        commencesAt: new Date(Date.now() + 3_600_000) // NEXT 1HR
    }, adminLoginInfo.user.id);
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - Get fixture with valid data", async () => {
    const res = await request(app)
      .get(`/fixtures/${createdFixture._id}`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.SUCCESS);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("commencesAt");
    expect(res.body).toHaveProperty("homeTeamId", createdFixture.homeTeamId.toString());
    expect(res.body).toHaveProperty("awayTeamId", createdFixture.awayTeamId.toString());
    expect(res.body).toHaveProperty("status", FixtureStatus.PENDING);
  });

  it("[400] - Get fixture with invalid ID format in request object", async () => {
    const res = await request(app)
        .get("/fixtures/abcd")
        .expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
  });

  it("[401] - Get fixture without auth-token", async () => {
    const res = await request(app)
      .get(`/fixtures/${createdFixture._id}`)
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Get fixture without being an admin", async () => {
    const res = await request(app)
      .get(`/fixtures/${createdFixture._id}`)
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });

  it("[404] - Get fixture with ID that does not exist", async () => {
    const res = await request(app)
      .get("/fixtures/abcd1234abcd1234abcd1234")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.NOT_FOUND);

    expect(res.body).toHaveProperty("message", "Fixture not found!");
  });

});
