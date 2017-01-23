import { Extendable } from './extendable';
import { applyMixins } from '../utils/applyMixins';

import { Expression } from '../expression';

export type ConditionalQueryProps = {
  where?: Expression<any, any>;
};

export class ConditionalQuery<Props extends ConditionalQueryProps> /** @internal */implements Extendable<Props> {

  /** @internal */
  readonly props: Props;

  /** @internal */
  extend: (props: Partial<Props>) => this;

  where(condition: Expression<any, any>) {
    return this.extend({
      where: this.props.where ? this.props.where.and(condition) : condition,
    } as Props);
  }

}

applyMixins(ConditionalQuery, Extendable);
