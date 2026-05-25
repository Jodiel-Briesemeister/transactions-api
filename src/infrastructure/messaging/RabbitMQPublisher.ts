import amqplib from 'amqplib';
import { IMessagePublisher } from '@domain/interfaces/IMessagePublisher';
import { ILogger } from '@domain/interfaces/ILogger';

export class RabbitMQPublisher implements IMessagePublisher {
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;

  constructor(
    private url: string,
    private logger: ILogger,
  ) {}

  private async getChannel(): Promise<amqplib.Channel> {
    if (this.channel) return this.channel;

    this.connection = await amqplib.connect(this.url);
    this.channel = await this.connection.createChannel();
    return this.channel;
  }

  async publish(queue: string, payload: Record<string, unknown>): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
    } catch (error) {
      this.logger.error('Failed to publish message', { queue, error });
    }
  }
}
