import { integer, object } from 'sukima'
import { QueryBuilder, QueryInterface } from 'knex'

import { mapValues } from '../utils'
import { Query, QueryProps } from './query'
import { Table } from '../table'
import { Column } from '../column'
import { Expression, AnyExpression } from '../expression'
import { ModifiableQueryProps, ModifiableModel, ModifiableQuery } from './modifiable'
import { ConditionalQuery, ConditionalQueryProps } from './conditional'
import { makeKnexRaw } from '../utils/makeKnexRaw'
import { applyMixins } from '../utils/applyMixins'

export type UpdateQueryProps<Model> =
  QueryProps<number> &
  ModifiableQueryProps<Model> &
  ConditionalQueryProps & {

    tableName: string;

  }

export class UpdateQuery<Model, Id extends keyof Model, Name extends string>
  extends Query<number, UpdateQueryProps<Model>>
  implements ModifiableQuery<Model, UpdateQueryProps<Model>, Name>, ConditionalQuery<UpdateQueryProps<Model>> {

  /** @internal */
  private static schema = integer().minimum(0)

  readonly set: <K extends keyof Model>(column: K | Column<Model, K, Name>, value: Model[K]) => this

  readonly setAttributes: (model: Partial<Model>) => this

  readonly setUnsafe: <K extends keyof Model>(
    column: K | Column<Model, K, Name>,
    value: Model[K] | Expression<Model[K]>,
  ) => this

  readonly setAttributesUnsafe: (model: ModifiableModel<Model>) => this

  readonly where: (condition: AnyExpression) => this

  /** @internal */
  constructor(
    tableMeta: Table<Model, Name, Id>,
  ) {
    super({
      schema: UpdateQuery.schema,
      inputSchema: object(
        mapValues(
          (schema: any) => schema.optional(), tableMeta.meta.schema,
        ),
      ),
      tableName: tableMeta.meta.tableName,
    })
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const { where, model, tableName } = this.props

    if (!model) {
      throw new Error('Update without any model.')
    }

    const rawModel = mapValues(
      (value, key) => {
        if (value instanceof Expression) {
          return makeKnexRaw(query, value.sql, value.bindings, false)
        } else {
          return value
        }
      },
      model as any,
    )

    const builder = query.table(tableName).update(rawModel)

    if (where) {
      return builder.where(makeKnexRaw(query, where.sql, where.bindings, false))
    } else {
      return builder
    }
  }

}

applyMixins(UpdateQuery, ModifiableQuery, ConditionalQuery)
