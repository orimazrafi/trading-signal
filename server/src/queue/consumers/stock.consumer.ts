import type { ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { processStockTick } from "../../services/stock.service.js";
import { parseStockTickMessage } from "../../types/stock.js";
import { connectRabbitMq, getRabbitChannel } from "../rabbit.connection.js";

/** Parses and validates an incoming tick payload from RabbitMQ. */
function parseTickMessage(message: ConsumeMessage) {
  const payload: unknown = JSON.parse(message.content.toString());
  const tick = parseStockTickMessage(payload);

  if (!tick) {
    throw new Error("Invalid tick payload: symbol, price, and userId are required");
  }

  return tick;
}

/** Starts consuming stock tick messages from RabbitMQ. */
export async function startStockConsumer(): Promise<void> {
  try {
    const channel = await connectRabbitMq();
    console.log("[worker] Connected to RabbitMQ");

    await channel.consume(env.stockTicksQueue, async (message) => {
      const activeChannel = getRabbitChannel();
      if (!message || !activeChannel) return;

      try {
        const tick = parseTickMessage(message);
        await processStockTick(tick);
        activeChannel.ack(message);
        console.log(`[consumer] Acknowledged tick for ${tick.symbol}`);
      } catch (error) {
        console.error("[consumer] Failed to process tick, message will be requeued:", error);
        activeChannel.nack(message, false, true);
      }
    });

    console.log("[consumer] Stock tick consumer is running");
  } catch (error) {
    console.error("[worker] Failed during RabbitMQ setup:", error);
    process.exit(1);
  }
}
