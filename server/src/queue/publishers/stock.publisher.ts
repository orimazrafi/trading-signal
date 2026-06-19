import { env } from "../../config/env.js";
import type { StockTickMessage } from "../../types/stock.js";
import { connectRabbitMq, getRabbitChannel } from "../rabbit.connection.js";

/** Publishes a stock price tick to the RabbitMQ queue. */
export async function publishStockTick(tick: StockTickMessage): Promise<void> {
  let channel = getRabbitChannel();
  if (!channel) {
    channel = await connectRabbitMq();
  }

  const payload = Buffer.from(JSON.stringify(tick));
  channel.sendToQueue(env.stockTicksQueue, payload, { persistent: true });
  console.log(`[publisher] Sent tick for ${tick.symbol} @ ${tick.price}`);
}
