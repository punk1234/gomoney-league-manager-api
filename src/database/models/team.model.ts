import { model, Schema } from "mongoose";
import { ITeam } from "../types/team.type";

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    logoUrl: {
      type: String,
      required: false,
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      virtuals: false,

      transform: function (doc: any, ret: any) {
        delete ret._id;
        ret.id = doc._id;
      },
    },
  },
);

export default model<ITeam>("teams", TeamSchema);
