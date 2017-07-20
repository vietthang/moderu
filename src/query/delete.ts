import { integer } from 'sukima'
import { QueryBuilder, QueryInterface } from 'knex'

import { AnyExpression } from '../expression'
import { Table } from '../table'
import { ConditionalQuery, ConditionalQueryProps } from './conditional'
import { Query, QueryProps } from './query'
import { makeKnexRaw } from '../utils/makeKnexRaw'
import { applyMixins } from '../utils/applyMixins'

export type DeleteProps = QueryProps<number> & ConditionalQueryProps & {

  readonly tableName: string;

}

export class DeleteQuery<Model> extends Query<number, DeleteProps> implements ConditionalQuery<DeleteProps> {

  /** @internal */
  private static schema = integer().minimum(0)

  where: (condition: AnyExpression) => this

  /** @internal */
  constructor(
    tableMeta: Table<Model, any>,
  ) {
    super({
      tableName: tableMeta.meta.tableName,
      schema: DeleteQuery.schema,
      transfomers: [],
    })
  }

  /** @internal */
  protected buildQuery(qb: QueryInterface): QueryBuilder {
    const builder = qb.table(this.props.tableName).del()

    const { where } = this.props

    if (where) {
      return builder.where(makeKnexRaw(qb, where.sql, where.bindings, false))
    } else {
      return builder
    }
  }

}

applyMixins(DeleteQuery, ConditionalQuery)
