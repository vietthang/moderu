import { Schema, validate } from 'sukima';
import { QueryInterface, QueryBuilder } from 'knex';

import { Extendable } from './extendable';
import { applyMixins } from '../utils/applyMixins';

export type QueryProps<Value> = {
  schema: Schema<Value>;
};

export abstract class Query<Value, Props extends QueryProps<Value>> implements Extendable<Props> {

  readonly props: Props;

  extend: (props: Partial<Props>) => this;

  constructor(props: Props) {
    this.props = props;
  }

  async execute(query: QueryInterface): Promise<Value> {
    const ret = await (this.executeQuery(query) as Promise<any>);
    return await validate(this.props.schema, ret, { convert: true });
  }

  toSQL(query: QueryInterface): any {
    return this.executeQuery(query).toSQL();
  }

  protected abstract executeQuery(qb: QueryInterface): QueryBuilder;

}

applyMixins(Query, Extendable);
