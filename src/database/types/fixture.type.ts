import { Document } from "mongoose";
import { Fixture } from "../../models";

interface FixtureDoc extends Document {
  _id: string;
}

export type IFixture = Omit<Fixture, "id"> & FixtureDoc;
