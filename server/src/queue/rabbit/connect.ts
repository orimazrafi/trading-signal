import amqp, { type Channel } from "amqplib";
import { env } from "../../config/env.js";
import { attachConnectionHandlers } from "./lifecycle.js";
import { getRabbitChannel, setConnectionState } from "./state.js";
import { printLog } from "./utils.js";

/** Opens a RabbitMQ connection and prepares the stock ticks queue channel. */
export async function establishConnection(): Promise<Channel> {
  printLog("Connecting to RabbitMQ...");
  const connection = await amqp.connect(env.rabbitmqUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(env.stockTicksQueue, { durable: true });
  await channel.prefetch(10);

  attachConnectionHandlers(connection, channel);
  setConnectionState(connection, channel);

  printLog(`Connected to queue: ${env.stockTicksQueue}`);
  return channel;
}

/** Connects to RabbitMQ and returns a channel with prefetch for fair dispatch. */
export async function connectRabbitMq(): Promise<Channel> {
  const existingChannel = getRabbitChannel();
  if (existingChannel) {
    return existingChannel;
  }

  return establishConnection();
}
