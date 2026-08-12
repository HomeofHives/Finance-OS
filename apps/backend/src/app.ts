import Fastify from "fastify";

export const app = Fastify({
   logger: true
});


app.get("/", async () => {
   return {
      message: "FinanceOS API running"
   };
});
