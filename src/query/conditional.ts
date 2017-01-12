import { Query } from './base';

import { Condition } from '../condition';

export type ConditionalQueryProps = {
  where?: Condition;
}

export abstract class ConditionalQuery<Value, Props extends ConditionalQueryProps> extends Query<Value, Props> {

  where(condition: Condition) {
    return this.extend({
      where: this.props.where ? this.props.where.and(condition) : condition,
    } as Props);
  }

}