import { integer } from 'sukima';
import { QueryBuilder } from 'knex';

import { MetaData } from '../table';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { makeRaw } from './utils';

export class DeleteQuery<
  Model, Name extends string, Alias extends string, Id extends keyof Model,
> extends ConditionalQuery<number, ConditionalQueryProps, Model, Name, Alias, Id> {

  private static schema = integer().minimum(0);

  constructor(
    tableMeta: MetaData<Model, Name, Alias, Id>,
  ) {
    super(tableMeta, {}, DeleteQuery.schema);
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    const builder = qb.del();

    const { where } = this.props;

    if (where) {
      return builder.where(makeRaw(qb, where.sql, where.bindings));
    } else {
      return builder;
    }
  }

}