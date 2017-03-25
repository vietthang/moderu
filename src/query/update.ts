import { integer, object } from 'sukima'
import { QueryBuilder, QueryInterface } from 'knex'
import { mapObjIndexed } from 'ramda'

import { Query, QueryProps } from './base'
import { TableMeta } from '../table'
import { Column } from '../column'
import { Expression } from '../expression'
import { ModificationQueryProps, ValidationMode, ModificationModel, ModificationQuery } from './modification'
import { ConditionalQuery, ConditionalQueryProps } from './conditional'
import { makeKnexRaw } from '../utils/makeKnexRaw'
import { mapValues } from '../utils/mapValues'
import { applyMixins } from '../utils/applyMixins'

export type UpdateQueryProps<Model> =
  QueryProps<number> &
  ModificationQueryProps<Model> &
  ConditionalQueryProps & {

    tableName: string;

  }

export class UpdateQuery<Model>
  extends Query<number, UpdateQueryProps<Model>>
  implements ModificationQuery<Model, UpdateQueryProps<Model>>, ConditionalQuery<UpdateQueryProps<Model>> {

  /** @internal */
  private static schema = integer().minimum(0)

  validationMode: (validationMode: ValidationMode) => this

  value: (model: ModificationModel<Model>) => this

  set: <K extends keyof Model>(
    column: K | Column<Model, K>,
    value: Model[K] | Expression<Model[K], string>,
  ) => this

  where: (condition: Expression<any, any>) => this

  /** @internal */
  constructor (
    tableMeta: TableMeta<Model, any>,
  ) {
    super({
      validationMode: ValidationMode.SkipExpressions,
      schema: UpdateQuery.schema,
      inputSchema: object(
        mapObjIndexed(
          (schema: any) => schema.optional(), tableMeta.schema,
        ),
      ),
      tableName: tableMeta.name,
    })
  }

  /** @internal */
  protected buildQuery (query: QueryInterface): QueryBuilder {
    const { where, model, tableName } = this.props

    if (!model) {
      throw new Error('Update without any model.')
    }

    const rawModel = mapValues(model, (value, key) => {
      if (value instanceof Expression) {
        return makeKnexRaw(query, value.sql, value.bindings, false)
      } else {
        return value
      }
    })

    const builder = query.table(tableName).update(rawModel)

    if (where) {
      return builder.where(makeKnexRaw(query, where.sql, where.bindings, false))
    } else {
      return builder
    }
  }

}

applyMixins(UpdateQuery, ModificationQuery, ConditionalQuery)
