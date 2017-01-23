export class Extendable<Props> {

  /** @internal */
  public readonly props: Props;

  /** @internal */
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
