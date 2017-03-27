export class Extendable<Props extends object> {

  /** @internal */
  public readonly props: Props

  /** @internal */
  public extend<Keys extends keyof Props>(props: Pick<Props, Keys>): this {
    return Object.assign(
      Object.create(this.constructor.prototype),
      this,
      {
        props: {
          ...this.props as any,
          ...props as any,
        },
      },
    )
  }

}
