import crypto from "crypto";
import C from "../constants";
import { Inject, Service } from "typedi";
import { UserService } from "./user.service";
import { IUser } from "../database/types/user.type";
import { LoginDto, LoginResponse, RegisterUserDto } from "../models";
import { UnauthenticatedError } from "../exceptions";
import { IAuthTokenPayload } from "../interfaces";
import { JwtHelper, Logger, RateLimitManager } from "../helpers";
import config from "../config";
import { SessionService } from "./session.service";

@Service()
export class AuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    @Inject() private readonly userService: UserService,
    @Inject() private readonly sessionService: SessionService,
  ) {}

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

  /**
   * @method login
   * @async
   * @param {LoginDto} data
   * @returns {Promise<LoginResponse>}
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    const USER = await this.checkThatUserExistByEmailForLogin(data.email);

    this.userService.checkThatPasswordsMatch(data.password, USER.password as string);

    const AUTH_TOKEN_PAYLOAD = this.generateUserAuthTokenPayload(USER);
    const AUTH_TOKEN = JwtHelper.generateToken(AUTH_TOKEN_PAYLOAD, config.AUTH_TOKEN_TTL_IN_HOURS);

    // TODO: HANDLE SESSION MANAGEMENT USING CACHING MECHANISM
    RateLimitManager.reset(USER.email, C.ApiRateLimiterType.AUTH_LOGIN).catch();
    await this.sessionService.registerSession(USER._id.toString(), AUTH_TOKEN_PAYLOAD.sessionId);

    Logger.info(
      `User <${USER._id.toString()}> logged in successfully.` +
        `Session=${AUTH_TOKEN_PAYLOAD.sessionId}`,
    );

    return {
      user: USER,
      token: AUTH_TOKEN,
    } as LoginResponse;
  }

  /**
   * @method checkThatUserExistByEmailForLogin
   * @async
   * @param {string} email
   * @returns {Promise<IUser>}
   */
  private async checkThatUserExistByEmailForLogin(email: string): Promise<IUser> {
    const foundUser = await this.userService.getUserByIdentifier(C.UserIdentifier.EMAIL, email);

    if (foundUser) {
      return foundUser;
    }

    throw new UnauthenticatedError(C.ResponseMessage.ERR_INVALID_CREDENTIALS);
  }

  /**
   * @method generateUserAuthTokenPayload
   * @instance
   * @param {IUser} user
   * @returns {IAuthTokenPayload}
   */
  private generateUserAuthTokenPayload(user: IUser): IAuthTokenPayload {
    return {
      userId: user._id,
      isAdmin: user.isAdmin,
      sessionId: crypto.randomUUID().replace(/-/g, "") + crypto.randomBytes(4).toString("hex"),
    };
  }
}
