import { Schema, number, integer } from 'sukima';

import { Condition } from './condition';

const sumSchema = number().nullable();

const avgSchema = number().nullable();

const minSchema = number().nullable();

const maxSchema = number().nullable();

const countSchema = integer().nullable();

export type ConditionOperator =
  '=' | '>' | '<' | '>=' | '<=' |
  'like' | 'not like' |
  'between' | 'not between' |
  'in' | 'not in';

export type AggregateFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

export class Column<Value, Field extends string> {

  constructor(
    public readonly expression: string,
    public readonly bindings: any[],
    public readonly schema: Schema<Value>,
    public readonly alias: Field,
  ) {

  }

  distinct() {
    return new Column<Value, Field>(
      `DISTINCT(${this.expression})`,
      this.bindings,
      this.schema,
      this.alias,
    );
  }

  as<Field2 extends string>(alias: Field2) {
    return new Column<Value, Field2>(
      this.expression,
      this.bindings,
      this.schema,
      alias,
    );
  }

  is(operator: string, target: any | Column<any, string>): any {
    if (target instanceof Column) {
      return new Condition(
        `${this.expression} ${operator} ${this.expression}`,
        [...this.bindings, ...target.bindings]
      );
    } else {
      return new Condition(
        `${this.expression} ${operator} ?`,
        [...this.bindings, target]
      );
    }
  }

  equals(target: Value | Column<Value, string>) {
    return this.is('=', target);
  }

  notEquals(target: Value | Column<Value, string>) {
    return this.is('<>', target);
  }

  greaterThan(target: Value | Column<Value, string>) {
    return this.is('>', target);
  }

  greaterThanEqual(target: Value | Column<Value, string>) {
    return this.is('>=', target);
  }

  lessThan(target: Value | Column<Value, string>) {
    return this.is('<', target);
  }

  lessThanEqual(target: Value | Column<Value, string>) {
    return this.is('<=', target);
  }

  like(target: string | Column<string, string>) {
    return this.is('LIKE', target);
  }

  notLike(target: string | Column<string, string>) {
    return this.is('NOT LIKE', target);
  }

  between(lowerBound: number, upperBound: number) {
    return this.is('BETWEEN', [lowerBound, upperBound]);
  }

  notBetween(lowerBound: number, upperBound: number) {
    return this.is('NOT BETWEEN', [lowerBound, upperBound]);
  }

  in(target: Value[]) {
    return this.is('IN', target);
  }

  notIn(target: Value[]) {
    return this.is('NOT IN', target);
  }

  isNull() {
    return new Condition(`${this.expression} IS NULL`, this.bindings);
  }

  isNotNull() {
    return new Condition(`${this.expression} IS NOT NULL`, this.bindings);
  }

  withSchema<T>(schema: Schema<T>) {
    return new Column<T, Field>(
      this.expression,
      this.bindings,
      schema,
      this.alias,
    );
  }

  sum() {
    return new Column<number, 'sum'>(
      `SUM(${this.expression})`,
      this.bindings,
      sumSchema,
      'sum',
    );
  }

  avg() {
    return new Column<number, 'avg'>(
      `AVG(${this.expression})`,
      this.bindings,
      avgSchema,
      'avg',
    );
  }

  min() {
    return new Column<number, 'min'>(
      `MIN(${this.expression})`,
      this.bindings,
      minSchema,
      'min',
    );
  }

  max() {
    return new Column<number, 'max'>(
      `MAX(${this.expression})`,
      this.bindings,
      maxSchema,
      'max',
    );
  }

  count() {
    return new Column<number, 'count'>(
      `COUNT(${this.expression})`,
      this.bindings,
      countSchema,
      'count',
    );
  }

}

export type AnyColumn = Column<any, string>;
