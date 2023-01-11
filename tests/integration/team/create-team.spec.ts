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

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);

let app: Application;
let userLoginInfo: LoginResponse, adminLoginInfo: LoginResponse;

describe("POST /teams", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());

    await USER_SERVICE.createUser(UserMock.getValidAdminToCreate());
    adminLoginInfo = await AUTH_SERVICE.login({ ...UserMock.getValidAdminDataToLogin() });
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[201] - Create team with valid data", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .post("/teams")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.CREATED);

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("name", DATA.name);
    expect(res.body).toHaveProperty("code", DATA.code);
  });

  it("[400] - Create team with empty request object", async () => {
    const res = await request(app).post("/teams").send({}).expect(C.HttpStatusCode.BAD_REQUEST);

    expect(res.body).toHaveProperty("message");
    expect(res.body.data.errors).toHaveLength(2);
    expect(res.body.data.errors[0].path).toEqual("/body/name");
    expect(res.body.data.errors[1].path).toEqual("/body/code");
  });

  // TODO: FIX
  //   it("[400] - Create team with invalid fields in request object", async () => {
  //     const res = await request(app)
  //         .post("/teams")
  //         .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
  //         .send(TeamMock.getInvalidTeamToCreate())
  //         .expect(C.HttpStatusCode.BAD_REQUEST);

  //     expect(res.body).toHaveProperty("message");
  //     expect(res.body.data.errors).toHaveLength(2);
  //     expect(res.body.data.errors[0].path).toEqual("/body/name");
  //     expect(res.body.data.errors[1].path).toEqual("/body/code");
  //   });

  it("[401] - Create team without auth-token", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .post("/teams")
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", "Invalid token!");
  });

  it("[403] - Create team without being an admin", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .post("/teams")
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.UNAUTHORIZED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHORIZED);
  });

  it("[409] - Create team that already exist", async () => {
    const DATA = TeamMock.getValidTeamToCreate();

    const res = await request(app)
      .post("/teams")
      .set({ authorization: `Bearer ${adminLoginInfo.token}`, "Content-Type": "application/json" })
      .send(DATA)
      .expect(C.HttpStatusCode.CONFLICT);

    expect(res.body).toHaveProperty("message", "Team code already exist!");
  });
});
