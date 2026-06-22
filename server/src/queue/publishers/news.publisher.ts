import { env } from "../../config/env.js";
import { log } from "../../lib/logger.js";
import type { IncomingNewsArticle } from "../../types/news.js";
import { connectRabbitMq, getRabbitChannel } from "../rabbit/connection.js";

/** Publishes a raw news article to the market_news RabbitMQ queue. */
export async function publishNewsArticle(article: IncomingNewsArticle): Promise<void> {
  let channel = getRabbitChannel();
  if (!channel) {
    channel = await connectRabbitMq();
  }

  const payload = Buffer.from(JSON.stringify(article));
  channel.sendToQueue(env.marketNewsQueue, payload, { persistent: true });
  log.info("Published article to queue", {
    queue: env.marketNewsQueue,
    title: article.title,
    source: article.source,
  });
}
