import { Schema } from 'sukima';
import { QueryBuilder } from 'knex';

import { Query } from './base';

export type InsertQueryProps<Model> = {
  model?: Partial<Model>;
}

export class InsertQuery<Model, Id extends keyof Model> extends Query<Model[Id], InsertQueryProps<Model>> {

  constructor(
    tableName: string,
    model: Partial<Model>,
    idSchema: Schema<Model[Id]>,
  ) {
    super(tableName, idSchema, { model });
  }

  value(model: Partial<Model>) {
    return this.extend({ model });
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    return qb.insert(this.props.model);
  }

}