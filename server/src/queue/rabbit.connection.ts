import amqp, { type Channel } from "amqplib";
import { env } from "../config/env.js";

type RabbitConnection = Awaited<ReturnType<typeof amqp.connect>>;

let rabbitConnection: RabbitConnection | null = null;
let rabbitChannel: Channel | null = null;

/** Connects to RabbitMQ and returns a channel with prefetch for fair dispatch. */
export async function connectRabbitMq(): Promise<Channel> {
  console.log("[rabbit] Connecting to RabbitMQ...");
  rabbitConnection = await amqp.connect(env.rabbitmqUrl);
  rabbitConnection.on("error", (error) => {
    console.error("[rabbit] Connection error:", error);
  });
  rabbitConnection.on("close", () => {
    console.warn("[rabbit] Connection closed");
  });

  const channel = await rabbitConnection.createChannel();
  await channel.assertQueue(env.stockTicksQueue, { durable: true });
  await channel.prefetch(10);
  rabbitChannel = channel;
  console.log(`[rabbit] Connected to queue: ${env.stockTicksQueue}`);
  return channel;
}

/** Returns the active RabbitMQ channel if connected. */
export function getRabbitChannel(): Channel | null {
  return rabbitChannel;
}

/** Closes the RabbitMQ channel and connection. */
export async function closeRabbitConnection(): Promise<void> {
  await rabbitChannel?.close();
  await rabbitConnection?.close();
  rabbitChannel = null;
  rabbitConnection = null;
}
