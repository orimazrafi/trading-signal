import { connectRabbitMq, getRabbitChannel } from "../rabbit/connection.js";
import { registerNewsConsumer } from "./news.consumer.js";
import { registerStockConsumer } from "./stock.consumer.js";

/** Subscribes all RabbitMQ consumers on the active channel. */
export async function registerAllConsumers(): Promise<void> {
  const channel = getRabbitChannel() ?? (await connectRabbitMq());
  await Promise.all([registerStockConsumer(channel), registerNewsConsumer(channel)]);
}
