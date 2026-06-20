import type { Channel, ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { processStockTick } from "../../services/stock.service.js";
import { parseStockTickMessage } from "../../types/stock.js";
import { formatRabbitError, isFatalRabbitError } from "../rabbit/errors.js";
import {
  connectRabbitMq,
  getRabbitChannel,
  retryRabbitConnection,
  setRabbitReconnectHandler,
} from "../rabbit/connection.js";

/** Parses and validates an incoming tick payload from RabbitMQ. */
function parseTickMessage(message: ConsumeMessage) {
  const payload: unknown = JSON.parse(message.content.toString());
  const tick = parseStockTickMessage(payload);

  if (!tick) {
    throw new Error("Invalid tick payload: symbol, price, and userId are required");
  }

  return tick;
}

/** Subscribes to stock tick messages on the given channel. */
async function registerConsumer(channel: Channel): Promise<void> {
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
}

/** Connects if needed and subscribes to the stock ticks queue. */
async function startConsuming(): Promise<void> {
  const channel = getRabbitChannel() ?? (await connectRabbitMq());
  await registerConsumer(channel);
  console.log("[consumer] Stock tick consumer is running");
}

/** Starts consuming stock tick messages from RabbitMQ. */
export async function startStockConsumer(): Promise<void> {
  setRabbitReconnectHandler(startConsuming);

  try {
    await startConsuming();
  } catch (error) {
    console.error("[worker] Failed during RabbitMQ setup:", error);

    if (isFatalRabbitError(error)) {
      process.exit(1);
    }

    await retryRabbitConnection(formatRabbitError(error));
  }
}
