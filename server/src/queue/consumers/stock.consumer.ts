import type { Channel, ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { log } from "../../lib/logger/index.js";
import { processStockTick } from "../../services/stock.service.js";
import { parseStockTickMessage } from "../../types/stock.js";
import { formatRabbitError, isFatalRabbitError } from "../rabbit/errors.js";
import {
  connectRabbitMq,
  getRabbitChannel,
  retryRabbitConnection,
} from "../rabbit/connection.js";
import { iterateQueueMessages } from "../rabbit/consumeQueue.js";
import { parseQueueMessage } from "../rabbit/parseQueueMessage.js";

const QUEUE_NAME = env.stockTicksQueue;

/** Parses and validates an incoming tick payload from RabbitMQ. */
function parseTickMessage(message: ConsumeMessage) {
  const payload = parseQueueMessage<unknown>(message);

  if (!payload) {
    throw new Error("Invalid tick payload: message body is not valid JSON");
  }

  const tick = parseStockTickMessage(payload);

  if (!tick) {
    throw new Error("Invalid tick payload: symbol, price, and userId are required");
  }

  return tick;
}

/** Processes stock tick messages until the channel closes. */
async function runStockConsumerLoop(channel: Channel): Promise<void> {
  for await (const message of iterateQueueMessages(channel, QUEUE_NAME)) {
    const rabbitChannel = getRabbitChannel();
    if (!rabbitChannel) {
      return;
    }

    try {
      log.info("Received queue message", { queue: QUEUE_NAME });

      const tick = parseTickMessage(message);
      await processStockTick(tick);
      rabbitChannel.ack(message);
      log.info("Processed queue message", { queue: QUEUE_NAME, symbol: tick.symbol });
    } catch (err) {
      log.error("Failed to process queue message", err, { queue: QUEUE_NAME });
      rabbitChannel.nack(message, false, false);
    }
  }
}

/** Subscribes to stock tick messages on the given channel. */
export async function registerStockConsumer(channel: Channel): Promise<void> {
  void runStockConsumerLoop(channel);
  log.info("Stock tick consumer is running", { queue: QUEUE_NAME });
}

/** Starts consuming stock tick messages from RabbitMQ. */
export async function startStockConsumer(): Promise<void> {
  try {
    const channel = getRabbitChannel() ?? (await connectRabbitMq());
    await registerStockConsumer(channel);
  } catch (error) {
    log.error("Failed during RabbitMQ setup", error, { queue: QUEUE_NAME });

    if (isFatalRabbitError(error)) {
      process.exit(1);
    }

    await retryRabbitConnection(formatRabbitError(error));
  }
}
