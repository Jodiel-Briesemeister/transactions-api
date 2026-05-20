type UserProps = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CreateUserProps = Omit<UserProps, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>;

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly phone: string | null;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.phone = props.phone;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    return new User({
      ...props,
      id: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute (props: UserProps): User {
    return new User(props);
  }
}
