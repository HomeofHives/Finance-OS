import "dotenv/config";
import { app } from "./app.js";
import { connectDatabase } from "./database/connection.js";

connectDatabase();

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
   try {

      await app.listen({ port: PORT, host: "0.0.0.0" });

      console.log(`FinanceOS API running on port ${PORT}`);

   } catch (error) {

      app.log.error(error);
      process.exit(1);

   }
};

start();
