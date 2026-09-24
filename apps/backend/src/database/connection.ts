import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDatabase = async () => {
   await mongoose.connect(env.MONGODB_URI);
};
