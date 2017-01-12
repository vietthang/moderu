import { Schema, validate } from 'sukima';
import { QueryInterface, QueryBuilder } from 'knex';

import { MetaData } from '../table';

export abstract class Query<
  Value, PropTypes,
  Model, Name extends string, Alias extends string, Id extends keyof Model,
> {

  constructor(
    protected readonly tableMeta: MetaData<Model, Name, Alias, Id>,
    protected readonly props: PropTypes,
    private readonly schema: Schema<Value>,
  ) {

  }

  async execute(query: QueryInterface): Promise<Value> {
    const qb = query.table(this.tableMeta.name);
    const ret = await (this.transformQuery(qb) as Promise<any>);
    return validate(this.schema, ret);
  }

  protected abstract transformQuery(qb: QueryBuilder): QueryBuilder;

  protected extend(props: PropTypes): this {
    return Object.assign(
      Object.create(this.constructor.prototype),
      this,
      { props },
    );
  }

}