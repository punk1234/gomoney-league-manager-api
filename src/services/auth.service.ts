import { Inject, Service } from "typedi";
import { UserService } from "./user.service";
import { IUser } from "../database/types/user.type";
import { RegisterUserDto } from "../models";

@Service()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(@Inject() private readonly userService: UserService) {}

  /**
   * @method register
   * @async
   * @param {RegisterUserDto} data
   * @returns {Promise<IUser>}
   */
  async register(data: RegisterUserDto): Promise<IUser> {
    await this.userService.checkThatUserWithEmailDoesNotExist(data.email);

    return this.userService.createUser(data);
  }
}
