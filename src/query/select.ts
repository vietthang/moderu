import { QueryInterface, QueryBuilder } from 'knex'
import { Schema, array, object } from 'sukima'

import { AnyExpression, NamedExpression } from '../expression'
import { Query, QueryProps } from './query'
import { ConditionalQuery, ConditionalQueryProps } from './conditional'
import { applyMixins } from '../utils/applyMixins'
import { flatten } from '../utils'
import { Table } from '../table'
import { JoinedTable } from '../combinedTable'
import { Selector } from '../selector'
import { makeKnexRaw } from '../utils/makeKnexRaw'

export type SelectOrderByDirection = 'asc' | 'desc'

export type SelectOrderBy = {
  expression: AnyExpression;
  direction: SelectOrderByDirection;
}

export interface ColumnWithinEntry {
  key: string
  innerKeys: string[]
}

export type BaseSelectQueryProps<Model>
  = QueryProps<Model[]>
  & ConditionalQueryProps
  & {
    readonly orderBys?: SelectOrderBy[];
    readonly groupBys?: AnyExpression[];
    readonly having?: AnyExpression;
    readonly limit?: number;
    readonly offset?: number;
    readonly as?: string;
    readonly from: JoinedTable<any>;
    readonly columns: NamedExpression<any, any>[];
    readonly columnsWithin: ColumnWithinEntry[];
    readonly allColumns: boolean;
  }

function buildItemSchema<Model>(props: BaseSelectQueryProps<Model>): Schema<Model> {
  const { from, columns, columnsWithin } = props

  const columnsMapping = columnsWithin.reduce(
    (mapped, entry) => {
      return Object.assign(
        mapped,
        {
          [entry.key]: entry.innerKeys.reduce(
            (innerMapped, innerKey) => {
              return Object.assign(
                innerMapped,
                { [innerKey]: from.schemaMap[entry.key].getPropertyMap()[innerKey] },
              )
            },
            mapped[entry.key] || {},
          ),
        },
      )
    },
    {} as any,
  )

  const extraColumnsMapping = columns.reduce(
    (mapped, column) => {
      return Object.assign(
        mapped,
        { [column.alias]: column.schema },
      )
    },
    {},
  )

  return object<any>({
    ...columnsMapping,
    _: object(extraColumnsMapping),
  })
}

function convertJoinedTableToColumnsWithin(dataSet: JoinedTable<any>): ColumnWithinEntry[] {
  const tables = [dataSet.base.table].concat(dataSet.join.map(entry => entry.table))

  return flatten(tables.map(table => ({
    key: table.meta.name,
    innerKeys: table.meta.keys,
  })))
}

export class SelectQuery<CombinedModel, Model, Default extends CombinedModel | {}>
  extends Query<(Model & Default)[], BaseSelectQueryProps<Model & Default>>
  implements ConditionalQuery<BaseSelectQueryProps<Model & Default>> {

  where: (condition: AnyExpression) => this

  constructor(dataSet: JoinedTable<CombinedModel>) {
    super({
      from: dataSet,
      schema: null as any,
      columns: [],
      columnsWithin: convertJoinedTableToColumnsWithin(dataSet),
      allColumns: true,
    })
  }

  join<JoinModel, Name extends string>(
    table: Table<JoinModel, Name, any>,
    expression: AnyExpression,
  ): SelectQuery<CombinedModel & { [key in Name]: JoinModel }, Model, Default> {
    return this.extend({
      from: this.props.from.innerJoin(table, expression),
    }) as any
  }

  having(condition: AnyExpression): this {
    return this.extend({ having: this.props.having ? this.props.having.and(condition) : condition })
  }

  orderBy(expression: AnyExpression, direction: SelectOrderByDirection = 'asc'): this {
    return this.extend({ orderBys: (this.props.orderBys || []).concat({ expression, direction }) })
  }

  groupBy(expression: AnyExpression): this {
    return this.extend({ groupBys: (this.props.groupBys || []).concat(expression) })
  }

  limit(limit: number): this {
    return this.extend({ limit })
  }

  offset(offset: number): this {
    return this.extend({ offset })
  }

  columnsWithin<Key extends keyof CombinedModel>(
    table: Table<CombinedModel[Key], Key, any>,
  ): SelectQuery<
    CombinedModel,
    Model & { [key in Key]: { [innerKey in keyof CombinedModel[Key]]: CombinedModel[Key][innerKey] } },
    {}
  >

  columnsWithin<Key extends keyof CombinedModel, InnerKey extends keyof CombinedModel[Key]>(
    table: Table<CombinedModel[Key], Key, any>,
    ...columns: Selector<CombinedModel[Key], InnerKey, Key>[],
  ): SelectQuery<
    CombinedModel,
    Model & { [key in Key]: { [innerKey in InnerKey]: CombinedModel[Key][innerKey] } },
    {}
  >

  columnsWithin<Key extends keyof CombinedModel, InnerKey extends keyof CombinedModel[Key]>(
    table: Table<CombinedModel[Key], Key, any>,
    ...columns: Selector<CombinedModel[Key], InnerKey, Key>[],
  ): SelectQuery<
    CombinedModel,
    Model & { [key in Key]: { [innerKey in InnerKey]: CombinedModel[Key][innerKey] } },
    {}
  > {
    if (columns.length === 0) {
      return this.columnsWithin(table, table)
    }

    const { allColumns, columnsWithin } = this.props

    const newEntry = {
      key: table.meta.name,
      innerKeys: flatten(columns.map((column) => column.meta.keys)),
    }

    return this.extend({
      columnsWithin: allColumns ? [newEntry] : columnsWithin.concat(newEntry),
      allColumns: false,
    }) as any
  }

  columns<
    V1, K1 extends string
  >(
    column1: NamedExpression<V1, K1>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string
  >(
    column1: NamedExpression<V1, K1>,
    column2: NamedExpression<V2, K2>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string,
    V3, K3 extends string
  >(
    column1: NamedExpression<V1, K1>,
    column2: NamedExpression<V2, K2>,
    column3: NamedExpression<V3, K3>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } }
    & { _: { [key in K3]: V3 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string,
    V3, K3 extends string,
    V4, K4 extends string
  >(
    column1: NamedExpression<V1, K2>,
    column2: NamedExpression<V2, K2>,
    column3: NamedExpression<V3, K3>,
    column4: NamedExpression<V4, K4>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } }
    & { _: { [key in K3]: V3 } }
    & { _: { [key in K4]: V4 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string,
    V3, K3 extends string,
    V4, K4 extends string,
    V5, K5 extends string
  >(
    column1: NamedExpression<V1, K2>,
    column2: NamedExpression<V2, K2>,
    column3: NamedExpression<V3, K3>,
    column4: NamedExpression<V4, K4>,
    column5: NamedExpression<V5, K5>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } }
    & { _: { [key in K3]: V3 } }
    & { _: { [key in K4]: V4 } }
    & { _: { [key in K5]: V5 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string,
    V3, K3 extends string,
    V4, K4 extends string,
    V5, K5 extends string,
    V6, K6 extends string
  >(
    column1: NamedExpression<V1, K2>,
    column2: NamedExpression<V2, K2>,
    column3: NamedExpression<V3, K3>,
    column4: NamedExpression<V4, K4>,
    column5: NamedExpression<V5, K5>,
    column6: NamedExpression<V6, K6>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } }
    & { _: { [key in K3]: V3 } }
    & { _: { [key in K4]: V4 } }
    & { _: { [key in K5]: V5 } }
    & { _: { [key in K6]: V6 } },
    {}
  >

  columns<
    V1, K1 extends string,
    V2, K2 extends string,
    V3, K3 extends string,
    V4, K4 extends string,
    V5, K5 extends string,
    V6, K6 extends string,
    V7, K7 extends string
  >(
    column1: NamedExpression<V1, K2>,
    column2: NamedExpression<V2, K2>,
    column3: NamedExpression<V3, K3>,
    column4: NamedExpression<V4, K4>,
    column5: NamedExpression<V5, K5>,
    column6: NamedExpression<V6, K6>,
    column7: NamedExpression<V7, K7>,
  ): SelectQuery<
    CombinedModel,
    Model
    & { _: { [key in K1]: V1 } }
    & { _: { [key in K2]: V2 } }
    & { _: { [key in K3]: V3 } }
    & { _: { [key in K4]: V4 } }
    & { _: { [key in K5]: V5 } }
    & { _: { [key in K6]: V6 } }
    & { _: { [key in K7]: V7 } },
    {}
  >

  columns(...columns: NamedExpression<any, any>[]): SelectQuery<CombinedModel, any, any>

  columns(...expressions: NamedExpression<any, any>[]): SelectQuery<CombinedModel, any, any> {
    const { allColumns, columns, columnsWithin } = this.props

    return this.extend({
      columns: columns.concat(expressions),
      columnsWithin: allColumns ? [] : columnsWithin,
      allColumns: false,
    })
  }

  /** @internal */
  buildResult(result: any): any {
    return result.map((entry: any) => {
      const keys = Object.keys(entry)
      const base: any = Object.assign(
        {
          _: {},
          [this.props.from.base.table.meta.name]: {},
        },
        ...(this.props.from.join.map(entry => ({ [entry.table.meta.name]: {} }))),
      )
      const tables = this.props.from.join.map(entry => entry.table).concat(this.props.from.base.table)

      const mappedRaw = keys.reduce(
        (prev, key) => {
          const parts = key.match(/^\$_([a-zA-Z0-9]+)_([a-zA-Z0-9]+)$/)

          if (parts === null) {
            return Object.assign(
              {},
              prev,
              {
                _: Object.assign(
                  {},
                  prev._,
                  { [key]: entry[key] },
                ),
              },
            )
          }

          const namespace = parts[1]
          const field = parts[2]

          return Object.assign(
            {},
            prev,
            {
              [namespace]: Object.assign(
                {},
                prev[namespace],
                { [field]: entry[key] },
              ),
            },
          )
        },
        base,
      )

      return tables.reduce<any>(
        (prev, table) => {
          if (!table.meta.parse) {
            return prev
          }

          const name = table.meta.name

          return {
            ...prev,
            [name]: table.meta.parse(prev[name]),
          }
        },
        mappedRaw,
      )
    })
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const {
      from,
      columns,
      columnsWithin,
      orderBys,
      groupBys,
      having,
      where,
      limit,
      offset,
    } = this.props

    let qb = query.from(from.base.table.meta.tableName).as(from.base.table.meta.name)

    qb = from.join.reduce(
      (qb, entry) => {
        const raw = makeKnexRaw(
          query,
          `?? ?? ON ${entry.expression.sql}`,
          [entry.table.meta.tableName, entry.table.meta.name, ...entry.expression.bindings],
          true,
        )

        switch (entry.type) {
          case 'inner':
            return qb.innerJoin(raw)
          case 'left':
            return qb.leftJoin(raw)
          case 'right':
            return qb.rightJoin(raw)
          case 'full':
            return qb.fullOuterJoin(raw)
          default:
            throw new Error('Invalid join type')
        }
      },
      qb,
    )

    qb = columns.reduce<QueryBuilder>(
      (qb, column) => {
        return qb.column(
          makeKnexRaw(query, `${column.sql} AS ??`, column.bindings.concat(column.alias), true),
        )
      },
      qb,
    )

    qb = columnsWithin.reduce<QueryBuilder>(
      (qb, entry) => {
        return entry.innerKeys.reduce(
          (qb, innerKey) => {
            return qb.column(
              makeKnexRaw(
                query,
                '?? AS ??',
                [`${entry.key}.${innerKey}`, `$_${entry.key}_${innerKey}`],
                true,
              ),
            )
          },
          qb,
        )
      },
      qb,
    )

    if (limit !== undefined) {
      qb = qb.limit(limit)
    }

    if (offset !== undefined) {
      qb = qb.offset(offset)
    }

    if (orderBys !== undefined && orderBys.length > 0) {
      qb = orderBys.reduce(
        (query, { expression, direction }) => query.orderByRaw(
          makeKnexRaw(query, `${expression.sql} ${direction}`, expression.bindings, true),
        ),
        qb,
      )
    }

    if (groupBys !== undefined && groupBys.length > 0) {
      qb = groupBys.reduce(
       (query, expression) => query.groupBy(makeKnexRaw(query, expression.sql, expression.bindings, true)),
       qb,
      )
    }

    if (where !== undefined) {
      qb = qb.where(makeKnexRaw(qb, where.sql, where.bindings, true))
    }

    if (having !== undefined) {
      qb = qb.having(makeKnexRaw(qb, having.sql, having.bindings, true))
    }

    return qb
  }

  /** @internal */
  protected buildSchema(): Schema<(Model & Default)[]> {
    return array(buildItemSchema(this.props))
  }

}

applyMixins(SelectQuery, ConditionalQuery)
