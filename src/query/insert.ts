import { QueryBuilder } from 'knex';

import { MetaData } from '../table';
import { Query } from './base';

export type InsertQueryProps<Model> = {
  model?: Partial<Model>;
}

export class InsertQuery<
  Model, Name extends string, Alias extends string, Id extends keyof Model,
> extends Query<Model[Id], InsertQueryProps<Model>, Model, Name, Alias, Id> {

  constructor(
    tableMeta: MetaData<Model, Name, Alias, Id>,
    model?: Partial<Model>,
  ) {
    super(tableMeta, { model }, tableMeta.schema.getPropertySchema(tableMeta.idAttribute));
  }

  value(model: Partial<Model>) {
    return this.extend({ model });
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    return qb.insert(this.props.model);
  }

}