import mongoose from "mongoose";
import { env } from "../config/env.js";

export const connectDatabase = async () => {

   if (!env.MONGODB_URI) throw new Error("MongoDB URI missing");

   await mongoose.connect(env.MONGODB_URI);

   console.log("Database connected");

};
