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

export type InsertQueryProps<Model, Id extends keyof Model> = QueryProps<Model[Id]> & ModifiableQueryProps<Model> & {

  readonly tableName: string;

  readonly idAttribute: Id;

}

export interface Blah {

  (model: number): number

  (key: string, value: string): string

}

export class InsertQuery<Model, Id extends keyof Model, Name extends string>
  extends Query<Model[Id], InsertQueryProps<Model, Id>>
  implements ModifiableQuery<Model, InsertQueryProps<Model, Id>, Name> {

  readonly set: <K extends keyof Model>(column: K | Column<Model, K, Name>, value: Model[K]) => this

  readonly setAttributes: (model: Partial<Model>) => this

  readonly setUnsafe: <K extends keyof Model>(
    column: K | Column<Model, K, Name>,
    value: Model[K] | Expression<Model[K]>,
  ) => this

  readonly setAttributesUnsafe: (model: ModifiableModel<Model>) => this

  /** @internal */
  constructor(table: Table<Model, Name, Id>) {
    super({
      schema: table.meta.schema.getPropertyMap()[table.meta.idAttribute],
      inputSchema: object(
        mapValues(
          (schema: any) => schema.optional(), table.meta.schema,
        ),
      ),
      tableName: table.meta.tableName,
      idAttribute: table.meta.idAttribute,
    })
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const { model, tableName, idAttribute } = this.props

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

    return query.table(tableName).insert(rawModel).returning(idAttribute)
  }

}

applyMixins(InsertQuery, ModifiableQuery)
