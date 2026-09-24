import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./database/connection.js";

const start = async () => {
   try {
      // Initialize the database before accepting requests.
      await connectDatabase();
      app.log.info("Database connected");

      await app.listen({ port: env.PORT, host: "0.0.0.0" });

      app.log.info(`FinanceOS API running on port ${env.PORT}`);
   } catch (error) {
      app.log.error(error);
      process.exit(1);
   }
};

start();
