type UserProps = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

type CreateUserProps = Omit<UserProps, 'id' | 'createdAt'>;

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly createdAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: '',
      createdAt: new Date(),
    });
  }

  static reconstitute (props: UserProps): User {
    return new User(props);
  }
}
