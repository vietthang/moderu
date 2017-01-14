import { array } from 'sukima';
import { QueryBuilder, JoinClause } from 'knex';

import { makeRaw } from './utils';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { Expression, AnyExpression } from '../expression';
import { Table, MetaData } from '../table';
import { Condition } from '../condition';

export type SelectOrderByDirection = 'asc' | 'desc';

export type SelectOrderBy = {
  column: Expression<any, string>;
  direction: SelectOrderByDirection;
};

export type SelectJoin = {
  table: string;
  alias?: string;
  on: Condition;
}

export type SelectQueryProps = ConditionalQueryProps & {
  columns?: Expression<any, string>[];
  orderBys?: SelectOrderBy[];
  groupBys?: Expression<any, string>[];
  having?: Condition;
  joins?: SelectJoin[];
  limit?: number;
  offset?: number;
}

export type KeyValue<Value, Key extends string> = {
  [K in Key]: Value
}

export class SelectQuery<Model> extends ConditionalQuery<Model[], SelectQueryProps, Model, string, string, any> {

  constructor(
    tableMeta: MetaData<Model, string, string, any>,
  ) {
    super(tableMeta, {}, array().items(tableMeta.schema));
  }

  join<Model2, TableName2 extends string, Alias2 extends string, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, TableName2, Alias2, Id2>,
    sourceColumn: Expression<Value, string>,
    targetColumn: Expression<Value, string>,
  ) {
    return this.extend({
      joins: (this.props.joins || []).concat({
        table: table2.$meta.name,
        alias: table2.$meta.alias,
        on: sourceColumn.is('=', targetColumn),
      }),
    });
  }

  groupBy(...columns: AnyExpression[]) {
    return this.extend({ groupBys: columns });
  }

  having(condition: Condition) {
    return this.extend({ having: condition });
  }

  orderBy(column: AnyExpression, direction: 'asc' | 'desc' = 'asc') {
    return this.extend({ orderBys: [{ column, direction }] });
  }

  limit(limit: number): this {
    return this.extend({ limit });
  }

  offset(offset: number): this {
    return this.extend({ offset });
  }

  columns(column: '*'): SelectQuery<Model>;

  columns<Mapping>(mapping: { [P in keyof Mapping]: Expression<Mapping[P], P> }): SelectQuery<Mapping>;

  columns<
    Value0, Key0 extends string
  >(
    column0: Expression<Value0, Key0>,
  ): SelectQuery<
    & KeyValue<Value0, Key0>
  >;

  columns<
    Value0, Key0 extends string,
    Value1, Key1 extends string
  >(
    column0: Expression<Value0, Key0>,
    column1: Expression<Value1, Key1>,
  ): SelectQuery<
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
    & KeyValue<Value0, Key0>
    & KeyValue<Value1, Key1>
    & KeyValue<Value2, Key2>
    & KeyValue<Value3, Key3>
    & KeyValue<Value4, Key4>
    & KeyValue<Value5, Key5>
    & KeyValue<Value6, Key6>
  >;

  columns(...columns: any[]): SelectQuery<any> {
    if (columns.length === 1) {
      const column = columns[0];
      if (column === '*') {
        return this.extend({
          columns: [],
        });
      } else if (!(column instanceof Expression)) {
        return this.extend({
          columns: Object
            .keys(column)
            .map(key => column[key].as(key)),
        });
      }
    }

    columns.forEach(column => {
      if (!(column instanceof Expression)) {
        throw new Error('Input argument is not Column object');
      }
    })

    return this.extend({
      columns,
    });
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    const {
      columns,
      orderBys,
      groupBys,
      having,
      where,
      joins,
      limit,
      offset,
    } = this.props;

    if (!columns) {
      qb = qb.select('*');
    } else {
      qb = columns.reduce(
        (qb, column) => qb.select(
          makeRaw(qb, `${column.expression} AS ??`, [...column.bindings, column.alias])),
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
       (qb, { column, direction }) => qb.orderByRaw(makeRaw(qb, `${column.expression} ${direction}`, column.bindings)),
       qb,
      );
    }

    if (groupBys !== undefined && groupBys.length > 0) {
      qb = groupBys.reduce(
       (qb, column) => qb.groupBy(makeRaw(qb, column.expression, column.bindings)),
       qb,
      );
    }

    if (where !== undefined) {
      qb = qb.where(makeRaw(qb, where.sql, where.bindings));
    }

    if (having !== undefined) {
      qb = qb.having(makeRaw(qb, having.sql, having.bindings));
    }

    if (joins !== undefined && joins.length > 0) {
      qb = joins.reduce(
       (qb, join) => qb.join(join.table, (q: JoinClause) => q.on(makeRaw(qb, join.on.sql, join.on.bindings))),
       qb,
      );
    }

    return qb;
  }

}