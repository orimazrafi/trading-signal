import type { Channel, ConsumeMessage } from "amqplib";

/** Yields messages from a queue using channel.consume. */
export async function* iterateQueueMessages(
  channel: Channel,
  queueName: string,
): AsyncGenerator<ConsumeMessage> {
  const inbox: ConsumeMessage[] = [];
  let resume: (() => void) | undefined;
  let closed = false;

  const notify = () => resume?.();

  void channel.consume(queueName, (message) => {
    if (!message) {
      closed = true;
      notify();
      return;
    }

    inbox.push(message);
    notify();
  });

  while (!closed || inbox.length > 0) {
    if (inbox.length === 0) {
      await new Promise<void>((resolve) => {
        resume = resolve;
      });
      continue;
    }

    yield inbox.shift()!;
  }
}
