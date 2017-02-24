import { Schema, validate } from 'sukima';
import { QueryInterface, QueryBuilder } from 'knex';

import { Extendable } from './extendable';
import { applyMixins } from '../utils/applyMixins';

export type QueryProps<Value> = {
  schema: Schema<Value>;
};

export abstract class Query<Value, Props extends QueryProps<Value>> implements Extendable<Props> {

  /** @internal */
  readonly props: Props;

  /** @internal */
  extend: (props: Partial<Props>) => this;

  /** @internal */
  constructor(props: Props) {
    this.props = props;
  }

  async execute(query: QueryInterface): Promise<Value> {
    const raw = await this.buildQuery(query);
    const output = await validate(this.props.schema, raw, { convert: true });
    this.afterQuery(output);
    return output;
  }

  toSQL(query: QueryInterface): any {
    return this.buildQuery(query).toSQL();
  }

  /** @internal */
  protected abstract buildQuery(qb: QueryInterface): QueryBuilder;

  /** @internal */
  protected abstract afterQuery(output: Value): Promise<void>;

}

applyMixins(Query, Extendable);
