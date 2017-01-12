import { Schema, validate } from 'sukima';
import { QueryInterface, QueryBuilder } from 'knex';

export abstract class Query<Value, PropTypes extends {}> {

  constructor(
    private readonly tableName: string,
    private readonly schema: Schema<Value>,
    protected readonly props: PropTypes,
  ) {

  }

  async execute(query: QueryInterface): Promise<Value> {
    const qb = query.table(this.tableName);
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