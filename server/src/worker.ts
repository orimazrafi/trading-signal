import { connectWorkerInfrastructure } from "./config/bootstrap.js";
import { prisma } from "./config/prisma.js";
import { redis } from "./config/redis.js";
import { startStockConsumer } from "./queue/consumers/stock.consumer.js";
import { closeRabbitConnection } from "./queue/rabbit.connection.js";

/** Boots infrastructure connections and starts RabbitMQ consumers. */
async function startWorker(): Promise<void> {
  await connectWorkerInfrastructure();
  await startStockConsumer();
}

/** Gracefully closes broker, cache, and database connections. */
async function shutdown(): Promise<void> {
  console.log("[worker] Shutting down...");
  try {
    await closeRabbitConnection();
    await redis.quit();
    await prisma.$disconnect();
  } catch (error) {
    console.error("[worker] Shutdown error:", error);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startWorker().catch((error) => {
  console.error("[worker] Fatal startup error:", error);
  process.exit(1);
});
