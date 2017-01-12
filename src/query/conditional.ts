import { Query } from './base';

import { Condition } from '../condition';

export type ConditionalQueryProps = {
  where?: Condition;
}

export abstract class ConditionalQuery<
  Value, Props extends ConditionalQueryProps,
  Model, Name extends string, Alias extends string, Id extends keyof Model,
> extends Query<Value, Props, Model, Name, Alias, Id> {

  where(condition: Condition) {
    return this.extend({
      where: this.props.where ? this.props.where.and(condition) : condition,
    } as Props);
  }

}