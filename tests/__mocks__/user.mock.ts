/**
 * @class UserMock
 */
export class UserMock {

    static getValidUserToCreate() {
        return {
            email: "valid-email@email.com",
            password: "abcd#1234",
            isAdmin: true
        }
    }

    static getValidUserDataToLogin() {
        return {
            ...this.getValidUserToCreate(),
            isAdmin: undefined
        }
    }

    static getInvalidUserToCreate() {
        return {
            email: "invalid-email.com",
            password: "ab",
            isAdmin: "goat"
        }
    }

    static getInvalidUserToLogin() {
        return {
            ...this.getInvalidUserToCreate(),
            isAdmin: undefined
        }
    }

}