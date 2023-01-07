import C from "../constants";
import { Service } from "typedi";
import { PasswordHasher } from "../helpers";
import { RegisterUserDto } from "../models";
import { IUser } from "../database/types/user.type";
import UserModel from "../database/models/user.model";
import { ConflictError, UnauthenticatedError } from "../exceptions";

@Service()
export class UserService {
  /**
   * @method createUser
   * @async
   * @param {RegisterUserDto} data
   * @returns {Promise<IUser>}
   */
  async createUser(data: RegisterUserDto): Promise<IUser> {
    const PASSWORD_HASH: string = PasswordHasher.hash(data.password);

    const USER = new UserModel({
      ...data,
      password: PASSWORD_HASH,
    });

    return USER.save();
  }

  /**
   * @method getUserByIdentifier
   * @async
   * @param {string} identifierKey
   * @param {string} value
   * @returns {Promise<IUser>}
   */
  async getUserByIdentifier(identifierKey: string, value: string): Promise<IUser | null> {
    return UserModel.findOne({ [identifierKey]: value });
  }

  /**
   * @method checkThatUserWithEmailDoesNotExist
   * @async
   * @param {string} email
   */
  async checkThatUserWithEmailDoesNotExist(email: string): Promise<void> {
    const foundUser = await UserModel.findOne({ email });

    if (foundUser) {
      throw new ConflictError("User already exist!");
    }
  }

  /**
   * @method checkThatPasswordsMatch
   * @instance
   * @param {string} plainTextPassword
   * @param {string} passwordHash
   */
  checkThatPasswordsMatch(plainTextPassword: string, passwordHash: string): void {
    const VALID_PASSWORD = PasswordHasher.verify(plainTextPassword, passwordHash);

    if (!VALID_PASSWORD) {
      throw new UnauthenticatedError(C.ResponseMessage.ERR_INVALID_CREDENTIALS);
    }
  }
}
