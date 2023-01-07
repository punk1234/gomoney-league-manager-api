import { model, Schema } from "mongoose";
import { IUser } from "../types/user.type";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    firstName: { type: String },
    lastName: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      virtuals: false,

      transform: function (doc: any, ret: any) {
        delete ret._id;
        delete ret.password;
        ret.id = doc._id;
      },
    },
  },
);

export default model<IUser>("users", UserSchema);
