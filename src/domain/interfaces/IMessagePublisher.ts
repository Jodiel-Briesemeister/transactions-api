export interface IMessagePublisher {
  publish(queue: string, payload: Record<string, unknown>): Promise<void>;
}
