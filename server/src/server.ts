import { connectServerInfrastructure } from "./config/bootstrap.js";
import { env } from "./config/env.js";
import { log } from "./lib/logger/index.js";
import { createApp } from "./app.js";

/** Boots infrastructure connections and starts the Express API server. */
async function startServer(): Promise<void> {
  await connectServerInfrastructure();

  const app = createApp();

  app.listen(env.port, () => {
    log.info("API listening", { port: env.port });
  });
}

startServer().catch((error) => {
  log.error("Fatal startup error", error);
  process.exit(1);
});
