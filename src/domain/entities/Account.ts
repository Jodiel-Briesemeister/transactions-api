type AccountProps = {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
};

type CreateAccountProps = Omit<AccountProps, 'id' | 'createdAt'>;

export class Account {
  public readonly id: string;
  public readonly userId: string;
  public readonly balance: number;
  public readonly createdAt: Date;

  private constructor(props: AccountProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.balance = props.balance;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateAccountProps): Account {
    return new Account({ ...props, id: '', createdAt: new Date() });
  }

  static reconstitute(props: AccountProps): Account {
    return new Account(props);
  }
}
