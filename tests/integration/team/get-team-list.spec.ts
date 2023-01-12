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

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);
const TEAM_SERVICE = Container.get(TeamService);

let app: Application;
let adminLoginInfo: LoginResponse;

describe("GET /teams", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });

    const TEAMS = [
      { name: "aBAB", code: "AB1" },
      { name: "BBAA", code: "BA2" },
      { name: "BBCC", code: "BC3" },
      { name: "ABAa", code: "AA4" },
      { name: "AbAD", code: "DA5" },
    ];

    await Promise.all(
      TEAMS.map((team: any) => TEAM_SERVICE.createTeam(team, adminLoginInfo.user.id)),
    );
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - Get team-list with valid data", async () => {
    const res = await request(app)
      .get(`/teams?searchValue=aBA&limit=4`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.SUCCESS);

    const VALID_TEAM_NAMES = ["aBAB", "ABAa", "AbAD"];

    expect(res.body.records).toHaveLength(3);
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("size", 3);
    expect(res.body).toHaveProperty("limit", 4);

    expect(VALID_TEAM_NAMES.includes(res.body.records[0].name)).toEqual(true);
    expect(VALID_TEAM_NAMES.includes(res.body.records[1].name)).toEqual(true);
    expect(VALID_TEAM_NAMES.includes(res.body.records[2].name)).toEqual(true);
  });

  it("[400] - Get team-list with invalid query filter", async () => {
    const res = await request(app)
      .get(`/teams?searchValue=`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(1);
    expect(res.body.data.errors[0].path).toEqual("/query/searchValue");
  });

  it("[401] - Get team-list with missing token", async () => {
    const res = await request(app).get(`/teams`).expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });
});
