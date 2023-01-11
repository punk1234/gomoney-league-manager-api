/**
 * @class TeamMock
 */
 export class TeamMock {
    static getValidTeamToCreate() {
      return {
        name: "Team 1",
        code: "TM1"
      };
    }
  
    static getInvalidTeamToCreate() {
      return {
        name: "     ",
        code: " - "
      };
    }
  }
  