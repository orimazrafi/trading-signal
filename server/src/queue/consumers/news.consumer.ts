import type { Channel, ConsumeMessage } from "amqplib";
import { env } from "../../config/env.js";
import { log } from "../../lib/logger/index.js";
import { parseIncomingNewsArticle } from "../../lib/parseNews.js";
import { newsService } from "../../services/news.service.js";
import { formatRabbitError, isFatalRabbitError } from "../rabbit/errors.js";
import {
  connectRabbitMq,
  getRabbitChannel,
  retryRabbitConnection,
} from "../rabbit/connection.js";
import { iterateQueueMessages } from "../rabbit/consumeQueue.js";
import { parseQueueMessage } from "../rabbit/parseQueueMessage.js";

const QUEUE_NAME = env.marketNewsQueue;

/** Parses and validates an incoming news article from RabbitMQ. */
function parseNewsMessage(message: ConsumeMessage) {
  const payload = parseQueueMessage<unknown>(message);

  if (!payload) {
    throw new Error("Invalid news payload: message body is not valid JSON");
  }

  const article = parseIncomingNewsArticle(payload);

  if (!article) {
    throw new Error("Invalid news payload: title, url, source, and publishedAt are required");
  }

  return article;
}

/** Processes market news messages until the channel closes. */
async function runNewsConsumerLoop(channel: Channel): Promise<void> {
  for await (const message of iterateQueueMessages(channel, QUEUE_NAME)) {
    const rabbitChannel = getRabbitChannel();
    if (!rabbitChannel) {
      return;
    }

    try {
      log.info("Received queue message", { queue: QUEUE_NAME });

      const article = parseNewsMessage(message);
      const processed = await newsService.processIncomingNewsArticle(article);
      rabbitChannel.ack(message);
      log.info("Processed queue message", {
        queue: QUEUE_NAME,
        headline: processed.headline,
        sentiment: processed.sentiment,
      });
    } catch (err) {
      log.error("Failed to process queue message", err, { queue: QUEUE_NAME });
      rabbitChannel.nack(message, false, false);
    }
  }
}

/** Subscribes to market news messages on the given channel. */
export async function registerNewsConsumer(channel: Channel): Promise<void> {
  void runNewsConsumerLoop(channel);
  log.info("Market news consumer is running", { queue: QUEUE_NAME });
}

/** Starts consuming market news messages from RabbitMQ. */
export async function startNewsConsumer(): Promise<void> {
  try {
    const channel = getRabbitChannel() ?? (await connectRabbitMq());
    await registerNewsConsumer(channel);
  } catch (error) {
    log.error("Failed during RabbitMQ setup", error, { queue: QUEUE_NAME });

    if (isFatalRabbitError(error)) {
      process.exit(1);
    }

    await retryRabbitConnection(formatRabbitError(error));
  }
}
