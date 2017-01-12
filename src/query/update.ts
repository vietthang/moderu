import { integer } from 'sukima';
import { QueryBuilder } from 'knex';

import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { makeRaw } from './utils';

export type UpdateQueryProps<Model> = ConditionalQueryProps & {
  model?: Partial<Model>;
}

export class UpdateQuery<Model> extends ConditionalQuery<number, UpdateQueryProps<Model>> {

  private static schema = integer().minimum(0);

  constructor(
    tableName: string,
    model?: Partial<Model>,
  ) {
    super(tableName, UpdateQuery.schema, { model });
  }

  set(model: Partial<Model>) {
    return this.extend({
      model,
    });
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    const { where, model } = this.props;

    const builder = qb.update(model);

    if (where) {
      return builder.where(makeRaw(qb, where.sql, where.bindings));
    } else {
      return builder;
    }
  }

}
