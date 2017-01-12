import { integer } from 'sukima';
import { QueryBuilder } from 'knex';

import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { makeRaw } from './utils';

export class DeleteQuery extends ConditionalQuery<number, ConditionalQueryProps> {

  private static schema = integer().minimum(0);

  constructor(
    tableName: string,
  ) {
    super(tableName, DeleteQuery.schema, {});
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