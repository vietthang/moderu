import { array, object } from 'sukima';
import { ObjectSchema } from 'sukima/schemas/object';
import { QueryBuilder, QueryInterface, JoinClause } from 'knex';

import { Query, QueryProps } from './base';
import { makeKnexRaw } from '../utils/makeKnexRaw';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { Expression, equals } from '../expression';
import { Table, DataSet } from '../table';
import { Column } from '../column';
import { applyMixins } from '../utils/applyMixins';
import { mapValues } from '../utils/mapValues';

export type SelectOrderByDirection = 'asc' | 'desc';

export type SelectOrderBy = {
  column: Expression<any, string>;
  direction: SelectOrderByDirection;
};

export type SelectJoin = {
  table: string;
  alias?: string;
  on: Expression<any, any>;
};

export type SelectQueryProps<Model> =
  QueryProps<Model[]> &
  ConditionalQueryProps &
  {
    from?: WrappedSelectQuery<Model> | Table<Model, any>;
    columns?: Expression<any, string>[];
    orderBys?: SelectOrderBy[];
    groupBys?: Expression<any, string>[];
    having?: Expression<any, any>;
    joins?: SelectJoin[];
    limit?: number;
    offset?: number;
    as?: string;
  };

export type KeyValue<Value, Key extends string> = {
  [K in Key]: Value
};

export class SelectQuery<Model>
  extends Query<Model[], SelectQueryProps<Model>>
  implements ConditionalQuery<SelectQueryProps<Model>> {

  where: (condition: Expression<any, any>) => this;

  /** @internal */
  constructor() {
    super({ schema: array().items(object()) });
  }

  as(alias: string) {
    const { columns } = this.props;

    if (!columns || columns.length === 0) {
      throw new Error('Can not wrap query without columns.');
    }

    const indexedColumns = columns.reduce(
      (indexed, column) => {
        return Object.assign(
          {},
          indexed,
          { [column.alias as any]: new Column<any, any>(column.schema, column.alias, alias) },
        );
      },
      {} as { readonly [P in keyof Model]: Expression<Model[P], P> }
    );

    const meta = {
      alias,
      schema: object().properties(
        mapValues(indexedColumns, column => column.schema),
      ),
    };

    return Object.assign(
      this.extend({
        as: alias,
      }),
      {
        $meta: meta,
      },
      indexedColumns,
    ) as any as WrappedSelectQuery<Model>;
  }

  from(from: Table<any, any> | WrappedSelectQuery<any>) {
    return this.extend({
      from,
    });
  }

  join<Model2, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, Id2>,
    sourceColumn: Expression<Value, string>,
    targetColumn: Expression<Value, string>,
  ): WrappedSelectQuery<Model>;

  join<Model2, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, Id2>,
    condition: Expression<any, any>,
  ): WrappedSelectQuery<Model>;

  join<Model2, Id2 extends keyof Model2>(
    table2: Table<Model2, Id2>,
    ...args: any[],
  ) {
    if (args.length === 2) {
      return this.join(table2, equals(args[0], args[1]));
    } else if (args.length === 1) {
      const condition = args[0];
      if (condition instanceof Expression) {
        return this.extend({
          joins: (this.props.joins || []).concat({
            table: table2.$meta.name,
            alias: table2.$meta.name,
            on: condition,
          }),
        });
      }
    }

    throw new Error('Invalid argument(s).');
  }

  groupBy(...columns: Expression<any, any>[]) {
    return this.extend({ groupBys: this.props.groupBys ? this.props.groupBys.concat(columns) : columns });
  }

  having(condition: Expression<any, any>) {
    return this.extend({ having: this.props.having ? this.props.having.and(condition) : condition });
  }

  orderBy(column: Expression<any, any>, direction: 'asc' | 'desc' = 'asc') {
    const orderBy = { column, direction };
    return this.extend({ orderBys: this.props.orderBys ? this.props.orderBys.concat(orderBy) : [orderBy] });
  }

  limit(limit: number) {
    return this.extend({ limit });
  }

  offset(offset: number) {
    return this.extend({ offset });
  }

  columns<Model2>(table: Table<Model2, any>): SelectQuery<Model & Model2>;

  columns<Mapping>(mapping: { [P in keyof Mapping]: Expression<Mapping[P], any> }): SelectQuery<Model & Mapping>;

  columns<
    Value0, Key0 extends string
  >(
    column0: Expression<Value0, Key0>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string,
    Value2, Key2 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
    column2: Expression<Value2, Key2>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string,
    Value2, Key2 extends string,
    Value3, Key3 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
    column2: Expression<Value2, Key2>,
    column3: Expression<Value3, Key3>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
    & KeyValue<Value3, Key3>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string,
    Value2, Key2 extends string,
    Value3, Key3 extends string,
    Value4, Key4 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
    column2: Expression<Value2, Key2>,
    column3: Expression<Value3, Key3>,
    column4: Expression<Value4, Key4>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
    & KeyValue<Value3, Key3>
    & KeyValue<Value4, Key4>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string,
    Value2, Key2 extends string,
    Value3, Key3 extends string,
    Value4, Key4 extends string,
    Value5, Key5 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
    column2: Expression<Value2, Key2>,
    column3: Expression<Value3, Key3>,
    column4: Expression<Value4, Key4>,
    column5: Expression<Value5, Key5>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
    & KeyValue<Value3, Key3>
    & KeyValue<Value4, Key4>
    & KeyValue<Value5, Key5>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string,
    Value2, Key2 extends string,
    Value3, Key3 extends string,
    Value4, Key4 extends string,
    Value5, Key5 extends string,
    Value6, Key6 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
    column2: Expression<Value2, Key2>,
    column3: Expression<Value3, Key3>,
    column4: Expression<Value4, Key4>,
    column5: Expression<Value5, Key5>,
    column6: Expression<Value6, Key6>,
  ): SelectQuery<
    & Model
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
    & KeyValue<Value3, Key3>
    & KeyValue<Value4, Key4>
    & KeyValue<Value5, Key5>
    & KeyValue<Value6, Key6>
  >;

  columns(...columns: Expression<any, string>[]): SelectQuery<any>;

  columns(...columns: any[]): SelectQuery<any> {
    if (columns.length === 1) {
      const column = columns[0];
      if (column.$meta) {
        const schema: ObjectSchema<any> = column.$meta.schema;

        return this.columns(
          ...schema.keys().map(key => column[key])
        );
      } else if (!(column instanceof Expression)) {
        return this.columns(
          ...Object
            .keys(column)
            .map(key => column[key].as(key))
        );
      }
    }

    const expressions: Expression<any, string>[] = columns;

    const newColumns = this.props.columns ? this.props.columns.concat(expressions) : expressions;

    const schema = newColumns.reduce<ObjectSchema<any>>(
      (schema: ObjectSchema<any>, column) => {
        if (!(column instanceof Expression)) {
          throw new Error('Input argument is not Column object.');
        }

        if (column.alias === undefined) {
          throw new Error('Column does not has alias');
        }

        return schema.addProperty(column.alias, column.schema);
      },
      object().additionalProperties(false) as ObjectSchema<any>,
    );

    return this.extend({
      columns: newColumns,
      schema: array().items(schema),
    });
  }

  /** @internal */
  buildQuery(query: QueryInterface): QueryBuilder {
    const {
      from,
      columns,
      orderBys,
      groupBys,
      having,
      where,
      joins,
      limit,
      offset,
    } = this.props;

    let qb = query as QueryBuilder;

    if (from) {
      if (from instanceof SelectQuery) {
        qb = query.from((qb: QueryInterface) => {
          if (from.props.as) {
            return from.buildQuery(qb).as(from.props.as);
          } else {
            return from.buildQuery(qb);
          }
        });
      } else if (from.$meta) {
        qb = query.from(from.$meta.name);
      } else {
        throw new Error('Invalid from');
      }
    }

    if (!columns || columns.length === 0) {
      throw new Error('No columns to query.');
    } else {
      qb = columns.reduce(
        (qb, column) => qb.select(
          makeKnexRaw(qb, `${column.sql} AS ??`, [...column.bindings, column.alias], true)),
        qb,
      );
    }

    if (limit !== undefined) {
      qb = qb.limit(limit);
    }

    if (offset !== undefined) {
      qb = qb.offset(offset);
    }

    if (orderBys !== undefined && orderBys.length > 0) {
      qb = orderBys.reduce(
        (qb, { column, direction }) => qb.orderByRaw(
          makeKnexRaw(qb, `${column.sql} ${direction}`, column.bindings, true)
        ),
        qb,
      );
    }

    if (groupBys !== undefined && groupBys.length > 0) {
      qb = groupBys.reduce(
       (qb, column) => qb.groupBy(makeKnexRaw(qb, column.sql, column.bindings, true)),
       qb,
      );
    }

    if (where !== undefined) {
      qb = qb.where(makeKnexRaw(qb, where.sql, where.bindings, true));
    }

    if (having !== undefined) {
      qb = qb.having(makeKnexRaw(qb, having.sql, having.bindings, true));
    }

    if (joins !== undefined && joins.length > 0) {
      qb = joins.reduce(
        (qb, join) => qb.join(
          join.table,
          (q: JoinClause) => q.on(makeKnexRaw(qb, join.on.sql, join.on.bindings, true))
        ),
        qb,
      );
    }

    return qb;
  }

}

applyMixins(SelectQuery, ConditionalQuery);

export type WrappedSelectQuery<Model> = SelectQuery<Model> & DataSet<Model>;
