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

describe("DELETE /teams/:teamId", () => {
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

  //   it("[200] - Delete team with valid ID", async () => {
  //     const res = await request(app)
  //       .delete(`/teams/${createdTeam._id}`)
  //       .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
  //       .expect(C.HttpStatusCode.SUCCESS);

  //     expect(res.body).toHaveProperty("success", true);
  //   });

  it("[400] - Delete team with invalid ID format in request object", async () => {
    const res = await request(app)
      .delete(`/teams/abcd`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(1);
    expect(res.body.data.errors[0].path).toEqual("/params/teamId");
  });

  it("[401] - Delete team without auth-token", async () => {
    const res = await request(app)
      .delete(`/teams/${createdTeam._id}`)
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Delete team without being an admin", async () => {
    const res = await request(app)
      .delete(`/teams/${createdTeam._id}`)
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });

  it("[404] - Delete team with ID that does not exist", async () => {
    const res = await request(app)
      .delete(`/teams/abcd1234abcd1234abcd1234`)
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.NOT_FOUND);

    expect(res.body).toHaveProperty("message", "Team not found!");
  });
});
