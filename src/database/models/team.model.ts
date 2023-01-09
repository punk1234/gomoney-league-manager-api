import { model, Schema } from "mongoose";
import { ITeam } from "../types/team.type";
import { IPaginatedModel } from "../../interfaces";
import { paginationPlugin } from "../plugins/mongoose-pagination.plugin";

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

TeamSchema.plugin(paginationPlugin);

export default model<ITeam, IPaginatedModel<ITeam>>("teams", TeamSchema);
