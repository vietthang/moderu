export class Extendable<Props> {

  public readonly props: Props;

  public extend(props: Partial<Props>): this {
    return Object.assign(
      Object.create(this.constructor.prototype),
      this,
      {
        props: {
          ...this.props as any,
          ...props as any,
        },
      },
    );
  }

}
