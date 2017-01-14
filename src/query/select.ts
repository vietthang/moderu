import { array, object } from 'sukima';
import { ObjectSchema } from 'sukima/schemas/object';
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
    super(tableMeta, {}, array().items(object()));
  }

  join<Model2, TableName2 extends string, Alias2 extends string, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, TableName2, Alias2, Id2>,
    sourceColumn: Expression<Value, string>,
    targetColumn: Expression<Value, string>,
  ): this;

  join<Model2, TableName2 extends string, Alias2 extends string, Id2 extends keyof Model2, Value>(
    table2: Table<Model2, TableName2, Alias2, Id2>,
    condition: Condition,
  ): this;

  join<Model2, TableName2 extends string, Alias2 extends string, Id2 extends keyof Model2>(
    table2: Table<Model2, TableName2, Alias2, Id2>,
    ...args: any[],
  ) {
    if (args.length === 2) {
      const expression0 = args[0];
      const expression1 = args[1];
      if (expression0 instanceof Expression && expression1 instanceof Expression) {
        return this.join(table2, expression0.equals(expression1));
      }
    } else if (args.length === 1) {
      const condition = args[0];
      if (condition instanceof Condition) {
        return this.extend({
          joins: (this.props.joins || []).concat({
            table: table2.$meta.name,
            alias: table2.$meta.alias,
            on: condition,
          }),
        });
      }
    }

    throw new Error('Invalid argument(s).');
  }

  groupBy(...columns: AnyExpression[]) {
    return this.extend({ groupBys: this.props.groupBys ? this.props.groupBys.concat(columns) : columns });
  }

  having(condition: Condition) {
    return this.extend({ having: this.props.having ? this.props.having.and(condition) : condition });
  }

  orderBy(column: AnyExpression, direction: 'asc' | 'desc' = 'asc') {
    const orderBy = { column, direction };
    return this.extend({ orderBys: this.props.orderBys ? this.props.orderBys.concat(orderBy) : [orderBy] });
  }

  limit(limit: number): this {
    return this.extend({ limit });
  }

  offset(offset: number): this {
    return this.extend({ offset });
  }

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

  columns<Model2>(table: Table<Model2, string, string, any>): SelectQuery<Model & Model2>;

  columns<Mapping>(mapping: { [P in keyof Mapping]: Expression<Mapping[P], P> }): SelectQuery<Model & Mapping>;

  columns(...columns: Expression<any, string>[]): SelectQuery<any>;

  columns(...columns: any[]): SelectQuery<any> {
    if (columns.length === 1) {
      const column = columns[0];
      if (column.$meta) {
        return this.columns(
          ...Object
            .keys(column.$meta.schema.schema.properties)
            .map(key => column[key])
        );
      } else if (!(column instanceof Expression)) {
        return this.columns(
          ...Object
            .keys(column)
            .map(key => column[key].as(key))
        );
      }
    }

    const newColumns = this.props.columns ? this.props.columns.concat(columns) : columns;

    return this
      .extend(
        { columns: newColumns },
        array().items(
          newColumns.reduce(
            (schema: ObjectSchema<any>, column) => {
              if (!(column instanceof Expression)) {
                throw new Error('Input argument is not Column object.');
              }

              return schema.addProperty(column.alias, column.schema);
            },
            object().additionalProperties(false) as ObjectSchema<any>,
          ),
        ),
      );
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

    if (!columns || columns.length === 0) {
      throw new Error('No columns to query.');
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