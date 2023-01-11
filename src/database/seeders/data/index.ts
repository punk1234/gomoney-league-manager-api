import { PasswordHasher } from "../../../helpers";
import { CreateTeamDto, RegisterUserDto } from "../../../models";

/**
 * @name USERS_DATA
 */
const USERS_DATA: Array<RegisterUserDto> = Array.from({ length: 5 }).map((_: any, index: number) => ({
  email: `first.last${index}@gomoney.com`,
  password: PasswordHasher.hash("p@ssword"),
  isAdmin: (index % 2 == 0)
}));

/**
 * @name TEAMS_DATA
 */
const TEAMS_DATA: Array<CreateTeamDto> = Array.from({ length: 10 }).map((_: any, index: number) => ({
  name: "team" + index,
  code: "TM" + index,
}));

export { USERS_DATA, TEAMS_DATA };