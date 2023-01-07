import C from "../constants";
import { Service } from "typedi";
import { PasswordHasher } from "../helpers";
import { CreateTeamDto } from "../models";
import { IUser } from "../database/types/user.type";
import UserModel from "../database/models/user.model";
import { ConflictError, UnauthenticatedError } from "../exceptions";
import TeamModel from "../database/models/team.model";
import { ITeam } from "../database/types/team.type";

@Service()
export class TeamService {
  /**
   * @method createTeam
   * @async
   * @param {CreateTeamDto} data
   * @param {string} createdBy
   * @returns {Promise<ITeam>}
   */
  async createTeam(data: CreateTeamDto, createdBy: string): Promise<ITeam> {
    try {
      const TEAM = new TeamModel({ ...data, createdBy });
      return await TEAM.save();
    } catch(err: any) {
        
      this.handleDbUniqueConstraintError(err, "Team", "name");
      this.handleDbUniqueConstraintError(err, "Team", "code");

      throw err;
    }
  }

  /**
   * @method handleDbUniqueConstraintError
   * @param {any} err 
   * @param {string} entity 
   * @param {string} possibleConstraintField 
   */
  // TODO: MOVE TO DB-HELPER CLASS
  private handleDbUniqueConstraintError(err: any, entity: string, possibleConstraintField: string): void {
    if(err.name == "MongoServerError" && err.code === 11000 && err.keyPattern[possibleConstraintField]) {
      throw new ConflictError(
        `${entity} ${possibleConstraintField} '${err.keyValue[possibleConstraintField]}' already exist!`
      );
    }
  }

}
