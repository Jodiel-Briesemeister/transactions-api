import amqplib from 'amqplib';
import { context, propagation } from '@opentelemetry/api';
import { IMessagePublisher } from '@domain/interfaces/IMessagePublisher';
import { ILogger } from '@domain/interfaces/ILogger';

export class RabbitMQPublisher implements IMessagePublisher {
  private channel: amqplib.Channel | null = null;

  constructor(
    private url: string,
    private logger: ILogger,
  ) {}

  private async getChannel(): Promise<amqplib.Channel> {
    if (this.channel) return this.channel;

    const connection = await amqplib.connect(this.url);
    const channel = await connection.createChannel();
    this.channel = channel;
    return channel;
  }

  async publish(queue: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.assertQueue(queue, { durable: true });

      const headers: Record<string, string> = {};
      propagation.inject(context.active(), headers);

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        headers,
      });
    } catch (error) {
      this.logger.error('Failed to publish message', { queue, error });
    }
  }
}
