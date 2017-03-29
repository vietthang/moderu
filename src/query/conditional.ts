import { Extendable } from './extendable'
import { applyMixins } from '../utils/applyMixins'

import { AnyExpression } from '../expression'

export type ConditionalQueryProps = {
  where?: AnyExpression;
}

export class ConditionalQuery<Props extends ConditionalQueryProps> implements Extendable<Props> {

  /** @internal */
  readonly props: Props

  /** @internal */
  extend: <Keys extends keyof Props>(props: Pick<Props, Keys>) => this

  where(condition: AnyExpression): this {
    return this.extend({
      where: this.props.where ? this.props.where.and(condition) : condition,
    } as Props)
  }

}

applyMixins(ConditionalQuery, Extendable)
