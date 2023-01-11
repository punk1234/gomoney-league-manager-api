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

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);
const TEAM_SERVICE = Container.get(TeamService);

let app: Application;
let userLoginInfo: LoginResponse, adminLoginInfo: LoginResponse;
let createdTeams: Array<ITeam>;
let existingFixture: any;

describe("POST /fixtures", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });

    const TEAMS = TeamMock.getTeams();

    createdTeams = await Promise.all(
      TEAMS.map((team: any) => TEAM_SERVICE.createTeam(team, adminLoginInfo.user.id)),
    );
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[201] - Create fixture with valid data", async () => {
    const DATA = {
      homeTeamId: createdTeams[0]._id,
      awayTeamId: createdTeams[1]._id,
      commencesAt: new Date(Date.now() + 3_600_000), // NEXT 1HR
    };

    existingFixture = DATA;

    const res = await request(app)
      .post("/fixtures")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.CREATED);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("commencesAt");
    expect(res.body).toHaveProperty("homeTeamId", DATA.homeTeamId.toString());
    expect(res.body).toHaveProperty("awayTeamId", DATA.awayTeamId.toString());
    expect(res.body).toHaveProperty("status", FixtureStatus.PENDING);
  });

  it("[400] - Create fixture with empty request object", async () => {
    const res = await request(app).post("/fixtures").send({}).expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(3);
    expect(res.body.data.errors[0].path).toEqual("/body/homeTeamId");
    expect(res.body.data.errors[1].path).toEqual("/body/awayTeamId");
    expect(res.body.data.errors[2].path).toEqual("/body/commencesAt");
  });

  it("[400] - Create fixture with invalid fields in request object", async () => {
    const res = await request(app)
      .post("/fixtures")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(FixtureMock.getInvalidFixtureToCreate())
      .expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(3);
    expect(res.body.data.errors[0].path).toEqual("/body/homeTeamId");
    expect(res.body.data.errors[1].path).toEqual("/body/awayTeamId");
    expect(res.body.data.errors[2].path).toEqual("/body/commencesAt");
  });

  it("[401] - Create fixture without auth-token", async () => {
    const DATA = FixtureMock.getValidDataFormatToCreate();

    const res = await request(app)
      .post("/fixtures")
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Create fixture without being an admin", async () => {
    const DATA = FixtureMock.getValidDataFormatToCreate();

    const res = await request(app)
      .post("/fixtures")
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });

  it("[409] - Create fixture that already exist", async () => {
    const res = await request(app)
      .post("/fixtures")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(existingFixture)
      .expect(C.HttpStatusCode.CONFLICT);

    expect(res.body).toHaveProperty("message", "Fixture already exist!");
  });
});
