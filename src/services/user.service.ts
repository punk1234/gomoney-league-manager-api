import { Service } from "typedi";
import { PasswordHasher } from "../helpers";
import { RegisterUserDto } from "../models";
import { IUser } from "../database/types/user.type";
import UserModel from "../database/models/user.model";
import { ConflictError } from "../exceptions";

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
}
