import { env } from "../../config/env.js";
import { log } from "../../lib/logger/index.js";
import type { StockTickMessage } from "../../types/stock.js";
import { connectRabbitMq, getRabbitChannel } from "../rabbit/connection.js";

/** Publishes a stock price tick to the RabbitMQ queue. */
export async function publishStockTick(tick: StockTickMessage): Promise<void> {
  let channel = getRabbitChannel();
  if (!channel) {
    channel = await connectRabbitMq();
  }

  const payload = Buffer.from(JSON.stringify(tick));
  channel.sendToQueue(env.stockTicksQueue, payload, { persistent: true });
  log.info("Published stock tick to queue", {
    queue: env.stockTicksQueue,
    symbol: tick.symbol,
    price: tick.price,
  });
}
