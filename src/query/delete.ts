import { integer } from 'sukima';
import { QueryBuilder, QueryInterface } from 'knex';

import { Expression } from '../expression';
import { TableMeta } from '../table';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { Query, QueryProps } from './base';
import { makeKnexRaw } from '../utils/makeKnexRaw';
import { applyMixins } from '../utils/applyMixins';

export type DeleteProps = QueryProps<number> & ConditionalQueryProps;

export class DeleteQuery<Model> extends Query<number, DeleteProps> implements ConditionalQuery<DeleteProps> {

  private static schema = integer().minimum(0);

  where: (condition: Expression<any, any>) => this;

  constructor(
    private tableMeta: TableMeta<Model, any>,
  ) {
    super({ schema: DeleteQuery.schema });
  }

  protected executeQuery(qb: QueryInterface): QueryBuilder {
    const builder = qb.table(this.tableMeta.name).del();

    const { where } = this.props;

    if (where) {
      return builder.where(makeKnexRaw(qb, where.expression, where.bindings, false));
    } else {
      return builder;
    }
  }

}

applyMixins(DeleteQuery, ConditionalQuery);
