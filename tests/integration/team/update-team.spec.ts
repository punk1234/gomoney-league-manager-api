import Container from "typedi";
import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import { LoginResponse } from "../../../src/models";
import AppFactory from "../../__helpers__/app-factory.helper";
import { UserService } from "../../../src/services/user.service";
import { AuthService } from "../../../src/services/auth.service";
import { TeamMock } from "../../__mocks__/team.mock";
import { TeamService } from "../../../src/services/team.service";
import { ITeam } from "../../../src/database/types/team.type";

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);
const TEAM_SERVICE = Container.get(TeamService);

let app: Application;
let userLoginInfo: LoginResponse, adminLoginInfo: LoginResponse;
let createdTeam: ITeam;
const SUCCESS_UPDATE_TEAM_NAME = "Arsenal";

describe("PATCH /teams/:teamId", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });

    createdTeam = await TEAM_SERVICE.createTeam(
      TeamMock.getValidTeamToCreate(),
      adminLoginInfo.user.id,
    );
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - Update team with valid data", async () => {
    const DATA = {
      name: SUCCESS_UPDATE_TEAM_NAME,
      code: "ARS",
      logoUrl: "https://arsenal.com/logo.svg",
    };

    const res = await request(app)
      .patch(`/teams/${createdTeam._id}`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.SUCCESS);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", DATA.name);
    expect(res.body).toHaveProperty("code", DATA.code);
    expect(res.body).toHaveProperty("logoUrl", DATA.logoUrl);
  });

  // TODO: FIX
  //   it("[400] - Create team with invalid fields in request object", async () => {
  //     const res = await request(app)
  //         .patch(`/teams/${createdTeam._id}`)
  //         .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
  //         .send(TeamMock.getInvalidTeamToCreate())
  //         .expect(C.HttpStatusCode.BAD_REQUEST);

  //     expect(res.body).toHaveProperty("message");
  //     expect(res.body.data.errors).toHaveLength(2);
  //     expect(res.body.data.errors[0].path).toEqual("/body/name");
  //     expect(res.body.data.errors[1].path).toEqual("/body/code");
  //   });

  it("[401] - Update team without auth-token", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .patch(`/teams/${createdTeam._id}`)
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Update team without being an admin", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .patch(`/teams/${createdTeam._id}`)
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });

  it("[404] - Update team with ID that does not exist", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .patch(`/teams/abcd1234abcd1234abcd1234`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.NOT_FOUND);

    expect(res.body).toHaveProperty("message", "Team not found!");
  });

  it("[409] - Update team-name to name that already exist", async () => {
    const NEW_TEAM = await TEAM_SERVICE.createTeam(
      { name: "Barca", code: "FCB" },
      adminLoginInfo.user.id,
    );

    const res = await request(app)
      .patch(`/teams/${NEW_TEAM._id}`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send({ name: SUCCESS_UPDATE_TEAM_NAME })
      .expect(C.HttpStatusCode.CONFLICT);

    expect(res.body).toHaveProperty("message", "Team already exist!");
  });
});
