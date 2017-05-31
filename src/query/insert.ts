import { QueryBuilder, QueryInterface } from 'knex'
import { object } from 'sukima'

import { mapValues } from '../utils'
import { Column } from '../column'
import { Expression } from '../expression'
import { Query, QueryProps } from './query'
import { makeKnexRaw } from '../utils/makeKnexRaw'
import { ModifiableQuery, ModifiableQueryProps, ModifiableModel } from './modifiable'
import { applyMixins } from '../utils/applyMixins'
import { Table } from '../table'

export type InsertQueryProps<Model, ID extends keyof Model>
  = QueryProps<Model[ID] | null>
  & ModifiableQueryProps<Model>
  & {
    readonly table: Table<Model, string, ID>,
  }

export class InsertQuery<Model, Name extends string, ID extends keyof Model>
  extends Query<Model[ID] | null, InsertQueryProps<Model, ID>>
  implements ModifiableQuery<Model, InsertQueryProps<Model, ID>, Name> {

  readonly set: <K extends keyof Model>(column: K | Column<Model, K, Name>, value: Model[K]) => this

  readonly setAttributes: (model: Partial<Model>) => this

  readonly setUnsafe: <K extends keyof Model>(
    column: K | Column<Model, K, Name>,
    value: Model[K] | Expression<Model[K]>,
  ) => this

  readonly setAttributesUnsafe: (model: ModifiableModel<Model>) => this

  /** @internal */
  constructor(table: Table<Model, Name, ID>) {
    super({
      schema: table.meta.schema.getPropertyMap()[table.meta.idAttribute].nullable(),
      inputSchema: object(
        mapValues(
          (schema: any) => schema.optional(),
          table.meta.schema.getPropertyMap(),
        ),
      ),
      table,
    })
  }

  /** @internal */
  buildResult(result: any): any {
    return result.length ? result[0] : null
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const { model, table } = this.props

    if (!model) {
      throw new Error('Insert without any model.')
    }

    const rawModel = mapValues(
      (value, key) => {
        if (value instanceof Expression) {
          return makeKnexRaw(query, value.sql, value.bindings, false)
        } else {
          return value
        }
      },
      model,
    )

    return query.table(table.meta.tableName).insert(rawModel).returning(table.meta.idAttribute)
  }

}

applyMixins(InsertQuery, ModifiableQuery)
