import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import AppFactory from "../../__helpers__/app-factory.helper";
import { UserService } from "../../../src/services/user.service";
import Container from "typedi";
import { IUser } from "../../../src/database/types/user.type";
import config from "../../../src/config";

const USER_SERVICE = Container.get(UserService);

let app: Application;
let user: IUser;

describe("POST /auth/login", () => {
  beforeAll(async () => {
    app = await AppFactory.create();

    const USER_DATA = UserMock.getValidUserToCreate();
    user = await USER_SERVICE.createUser(USER_DATA);
  });

  afterAll(async () => {
    await AppFactory.destroy();
  });

  it("[200] - Login user with valid data", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send(UserMock.getValidUserDataToLogin())
      .expect(C.HttpStatusCode.SUCCESS);

    expect(res.body).toHaveProperty("user.id");
    expect(res.body).toHaveProperty("user.createdAt");
    expect(res.body).toHaveProperty("user.email", user.email);
    expect(res.body).toHaveProperty("user.isAdmin", user.isAdmin);
    expect(typeof res.body.token).toEqual("string");
  });

//   it("[400] - Login user with empty request object", async () => {
//     const res = await request(app)
//       .post("/auth/login")
//       .send({})
//       .expect(C.HttpStatusCode.BAD_REQUEST);

//     expect(res.body).toHaveProperty("message");
//     expect(res.body.data.errors).toHaveLength(2);
//     expect(res.body.data.errors[0].path).toEqual("/body/email");
//     expect(res.body.data.errors[1].path).toEqual("/body/password");
//   });

//   it("[400] - Login user with invalid email & password request object", async () => {
//     const res = await request(app)
//       .post("/auth/login")
//       .send({})
//       .expect(C.HttpStatusCode.BAD_REQUEST);

//     expect(res.body).toHaveProperty("message");
//     expect(res.body.data.errors).toHaveLength(2);
//     expect(res.body.data.errors[0].path).toEqual("/body/email");
//     expect(res.body.data.errors[1].path).toEqual("/body/password");
//   });

//   it("[401] - Login user with invalid password", async () => {
//     const res = await request(app)
//       .post("/auth/login")
//       .send({
//         email: user.email,
//         password: `${user.password}-wrong`,
//       })
//       .expect(C.HttpStatusCode.UNAUTHENTICATED);

//     expect(res.body).toHaveProperty("message", "Invalid user credentials!");
//   });

//   it("[401] - Login user with email that does not exist (confirm 404 is not returned for security)", async () => {
//     const res = await request(app)
//       .post("/auth/login")
//       .send({ email: "user.email@not-found.com", password: "p@ssword" })
//       .expect(C.HttpStatusCode.UNAUTHENTICATED);

//     expect(res.body).toHaveProperty("message", "Invalid user credentials!");
//   });

//   it("[429] - Logging in severals times with failed attempts", async () => {
//     const MAX_NO_OF_REQUEST_PLUS_ONE =
//       config.API_RATE_LIMITING[C.ApiRateLimiterType.AUTH_LOGIN].limit + 1;

//     const email = "login-rate-limit-email@rate.limit";
//     const password = "p@ssword";

//     await USER_SERVICE.createUser({ email, password, isAdmin: false });

//     for (let requestNo = 1; requestNo <= MAX_NO_OF_REQUEST_PLUS_ONE; requestNo++) {
//       const res = await request(app)
//         .post("/auth/login")
//         .send({ email, password: `${password}-wrong` });

//       if (requestNo === MAX_NO_OF_REQUEST_PLUS_ONE) {
//         expect(res.status).toBe(C.HttpStatusCode.TOO_MANY_REQUESTS);
//       } else {
//         expect(res.status).toBe(C.HttpStatusCode.UNAUTHENTICATED);
//         expect(res.body).toHaveProperty("message", "Invalid user credentials!");
//       }
//     }
//   });
});
