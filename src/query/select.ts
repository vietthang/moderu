import { Schema } from 'sukima';
import { QueryBuilder, JoinClause } from 'knex';

import { makeRaw } from './utils';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { Column, AnyColumn } from '../column';
import { Table } from '../table';
import { Condition } from '../condition';

export type SelectOrderByDirection = 'asc' | 'desc';

export type SelectOrderBy = {
  column: Column<any, string>;
  direction: SelectOrderByDirection;
};

export type SelectJoin = {
  table: string;
  alias?: string;
  on: Condition;
}

export type SelectProps = ConditionalQueryProps & {
  columns?: Column<any, string>[];
  orderBys?: SelectOrderBy[];
  groupBys?: Column<any, string>[];
  having?: Condition;
  joins?: SelectJoin[];
  limit?: number;
  offset?: number;
}

export class SelectQuery<Model> extends ConditionalQuery<Model[], SelectProps> {

  constructor(
    tableName: string,
    schema: Schema<Model[]>,
  ) {
    super(tableName, schema, {});
  }

  join<Model2, TableName2 extends string, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, TableName2, Id2>,
    sourceColumn: Column<Value, string>,
    targetColumn: Column<Value, string>,
  ) {
    return this.extend({
      joins: (this.props.joins || []).concat({
        table: table2.$name,
        alias: table2.$alias,
        on: sourceColumn.is('=', targetColumn),
      }),
    });
  }

  groupBy(...columns: AnyColumn[]) {
    return this.extend({ groupBys: columns });
  }

  having(condition: Condition) {
    return this.extend({ having: condition });
  }

  orderBy(column: AnyColumn, direction: 'asc' | 'desc' = 'asc') {
    return this.extend({ orderBys: [{ column, direction }] });
  }

  limit(limit: number): this {
    return this.extend({ limit });
  }

  offset(offset: number): this {
    return this.extend({ offset });
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
      qb = qb.select(...columns.map(column => column.getAlias()));
    }

    if (limit !== undefined) {
      qb = qb.limit(limit);
    }

    if (offset !== undefined) {
      qb = qb.offset(offset);
    }

    if (orderBys !== undefined && orderBys.length > 0) {
      qb = orderBys.reduce(
       (qb, { column, direction }) => qb.orderBy(column.getAlias(), direction),
       qb,
      );
    }

    if (groupBys !== undefined && groupBys.length > 0) {
      qb = groupBys.reduce(
       (qb, column) => qb.groupBy(column.getAlias()),
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