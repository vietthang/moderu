import { integer } from 'sukima';
import { QueryBuilder, QueryInterface } from 'knex';

import { Expression } from '../expression';
import { TableMeta } from '../table';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { Query, QueryProps } from './base';
import { makeKnexRaw } from '../utils/makeKnexRaw';
import { applyMixins } from '../utils/applyMixins';

export type DeleteProps = QueryProps<number> & ConditionalQueryProps & {

  readonly tableName: string;

};

export class DeleteQuery<Model> extends Query<number, DeleteProps> implements ConditionalQuery<DeleteProps> {

  /** @internal */
  private static schema = integer().minimum(0);

  where: (condition: Expression<any, any>) => this;

  /** @internal */
  constructor(
    tableMeta: TableMeta<Model, any>,
  ) {
    super({
      tableName: tableMeta.name,
      schema: DeleteQuery.schema,
    });
  }

  /** @internal */
  protected buildQuery(qb: QueryInterface): QueryBuilder {
    const builder = qb.table(this.props.tableName).del();

    const { where } = this.props;

    if (where) {
      return builder.where(makeKnexRaw(qb, where.sql, where.bindings, false));
    } else {
      return builder;
    }
  }

}

applyMixins(DeleteQuery, ConditionalQuery);
