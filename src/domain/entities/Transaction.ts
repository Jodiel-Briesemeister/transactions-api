import { TransactionType } from '@domain/enums/TransactionType';

type TransactionProps = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  recipientId: string | null;
  createdAt: Date;
};

type CreateTransactionProps = Omit<TransactionProps, 'id' | 'createdAt'>;

export class Transaction {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: TransactionType;
  public readonly amount: number;
  public readonly recipientId: string | null;
  public readonly createdAt: Date;

  private constructor(props: TransactionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.amount = props.amount;
    this.recipientId = props.recipientId;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateTransactionProps): Transaction {
    return new Transaction({ ...props, id: '', createdAt: new Date() });
  }

  static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }
}
