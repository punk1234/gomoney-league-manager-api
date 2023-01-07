import { Document } from "mongoose";
import { Team } from "../../models";

interface TeamDoc extends Document {
  _id: string;
}

export type ITeam = Omit<Team, "id"> & TeamDoc;
