import { model, Schema, Types } from "mongoose";
import { FixtureStatus } from "../../models";
import { IFixture } from "../types/fixture.type";

const FixtureSchema = new Schema(
  {
    homeTeamId: {
      type: Types.ObjectId,
      required: true,
      ref: "TeamModel",
    },
    awayTeamId: {
      type: Types.ObjectId,
      required: true,
      ref: "TeamModel",
    },
    commencesAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FixtureStatus),
      default: FixtureStatus.PENDING,
    },
    matchResult: {
      type: {
        homeTeamScore: { type: Number },
        awayTeamScore: { type: Number },
      },
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

export default model<IFixture>("fixtures", FixtureSchema);
