import request from "supertest";
import { Application } from "express";
import C from "../../../src/constants";
import { UserMock } from "../../__mocks__";
import AppFactory from "../../__helpers__/app-factory.helper";

let app: Application;

// export const registerUser = async () => {
//     const res = await request(app)
//             .post("/auth/register")
//             .send(UserMock.getValidUserToCreate())
//             .expect(C.HttpStatusCode.CREATED);
        
//     expect(res.body).toHaveProperty("success", true);
//     return res.body;
// }

describe("POST /auth/register", () => {

    beforeAll(async () => {
        app = await AppFactory.create();
    });

    afterAll(async () => {
        await AppFactory.destroy();
    });

    it("[201] - Register user with valid data", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send(UserMock.getValidUserToCreate())
            .expect(C.HttpStatusCode.CREATED);
        
        expect(res.body).toHaveProperty("success", true);
    });

    it("[400] - Register user with empty request object", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({})
            .expect(C.HttpStatusCode.BAD_REQUEST);
        
        expect(res.body).toHaveProperty("message");
        expect(res.body.data.errors).toHaveLength(3);
        expect(res.body.data.errors[0].path).toEqual("/body/email");
        expect(res.body.data.errors[1].path).toEqual("/body/password");
        expect(res.body.data.errors[2].path).toEqual("/body/isAdmin");
    });

    it("[400] - Register user with invalid email, password & isAdmin request object", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send(UserMock.getInvalidUserToCreate())
            .expect(C.HttpStatusCode.BAD_REQUEST);
        
        expect(res.body).toHaveProperty("message");
        expect(res.body.data.errors).toHaveLength(3);
        expect(res.body.data.errors[0].path).toEqual("/body/email");
        expect(res.body.data.errors[1].path).toEqual("/body/password");
        expect(res.body.data.errors[2].path).toEqual("/body/isAdmin");
    });

    it("[400] - Register user with invalid password in request object", async () => {
        const DATA = { ...UserMock.getValidUserToCreate(), password: UserMock.getInvalidUserToCreate().password };

        const res = await request(app)
            .post("/auth/register")
            .send(DATA)
            .expect(C.HttpStatusCode.BAD_REQUEST);
        
        expect(res.body).toHaveProperty("message");
        expect(res.body.data.errors).toHaveLength(1);
        expect(res.body.data.errors[0].path).toEqual("/body/password");
    });

    it("[409] - Register user that already exists with email!", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send(UserMock.getValidUserToCreate())
            .expect(C.HttpStatusCode.CONFLICT);
        
        expect(res.body).toHaveProperty("message", "User already exist!");
    });


    // it("[400] - Throw bad request error if email is missing in the request body", async () => {
    //     const res = await request(app)
    //         .post("/games/axie/accounts")
    //         .set({ authorization: `Bearer ${token}`, "Content-Type": "application/json" })
    //         .send({ password: gameAccountToTest.password })
    //         .expect(Constants.HttpStatusCode.BAD_REQUEST);

    //     expect(res.body.message).toEqual("Invalid request data");
    // });

    // it("[401] - Return error for unauthenticated users", async () => {
    //     const res = await request(app)
    //         .post("/games/axie/accounts")
    //         .expect(Constants.HttpStatusCode.UNAUTHENTICATED);

    //     expect(res.body.message).toEqual("User must be Logged in");
    // });

    // it("[404] - Throw not found error if game does not exist", async () => {
    //     const res = await request(app)
    //         .post("/games/invalid-game/accounts")
    //         .set({ authorization: `Bearer ${token}`, "Content-Type": "application/json" })
    //         .send(gameAccountToTest)
    //         .expect(Constants.HttpStatusCode.NOT_FOUND);

    //     expect(res.body.message).toEqual("Game does not exist");
    // });

    // it("[409] - Throw conflict error if game account already exist", async () => {
    //     requestSpy.mockResolvedValueOnce({ data: MockData.createWalletResponse });
    //     const res = await request(app)
    //         .post("/games/axie/accounts")
    //         .set({ authorization: `Bearer ${token}`, "Content-Type": "application/json" })
    //         .send(MockData.gameAccounts[0])
    //         .expect(Constants.HttpStatusCode.CONFLICT);

    //     expect(res.body.message).toEqual("Email already exist");
    // });

});
