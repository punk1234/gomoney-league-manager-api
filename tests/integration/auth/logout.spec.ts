import Container from "typedi";
import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import { LoginResponse } from "../../../src/models";
import AppFactory from "../../__helpers__/app-factory.helper";
import { UserService } from "../../../src/services/user.service";
import { AuthService } from "../../../src/services/auth.service";

const USER_SERVICE = Container.get(UserService);
const AUTH_SERVICE = Container.get(AuthService);

let app: Application;
let userLoginInfo: LoginResponse;

describe("POST /auth/logout", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    await USER_SERVICE.createUser(UserMock.getValidUserToCreate());
    userLoginInfo = await AUTH_SERVICE.login(UserMock.getValidUserDataToLogin());
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - User with auth-token can logout successfully & not access auth endpoints with token", async () => {
    let res = await request(app)
      .post("/auth/logout")
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.SUCCESS);

    expect(res.body).toHaveProperty("success", true);

    res = await request(app)
      .post("/auth/logout")
      .set({ authorization: `Bearer ${userLoginInfo.token}`, "Content-Type": "application/json" })
      .expect(C.HttpStatusCode.UNAUTHENTICATED);

    expect(res.body).toHaveProperty("message", C.ResponseMessage.ERR_UNAUTHENTICATED);
  });

//   it("[401] - Logging out without token fails", async () => {
//     const res = await request(app).post("/auth/logout").expect(C.HttpStatusCode.UNAUTHENTICATED);

//     expect(res.body).toHaveProperty("message", "Invalid token!");
//   });

//   it("[401] - Logging out with invalid token fails", async () => {
//     await request(app)
//       .post("/auth/logout")
//       .set({ authorization: `Bearer INVALID_TOKEN`, "Content-Type": "application/json" })
//       .expect(C.HttpStatusCode.UNAUTHENTICATED);
//   });
});
