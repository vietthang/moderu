import { Schema, number, integer } from 'sukima';
import flatten = require('lodash/flatten');

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

export type Value<Type> = Type | Expression<Type, string>;

export class Expression<OutputType, Field extends string> {

  constructor(
    public readonly expression: string,
    public readonly bindings: any[],
    public readonly schema: Schema<OutputType>,
    public readonly alias: Field,
  ) {

  }

  distinct() {
    return new Expression<OutputType, Field>(
      `DISTINCT(${this.expression})`,
      this.bindings,
      this.schema,
      this.alias,
    );
  }

  as<Field2 extends string>(alias: Field2) {
    return new Expression<OutputType, Field2>(
      this.expression,
      this.bindings,
      this.schema,
      alias,
    );
  }

  is<Type>(operator: string, ...target: (Value<Type> | Value<Type>[])[]): Condition {
    const values = flatten(target);

    const subExpressions = values.map(
      value => value instanceof Expression ? value.expression : '?'
    )

    const expression = `${this.expression} ${operator} (${subExpressions.join(',')})`
    const bindings = values.reduce(
      (bindings, value) => {
        if (value instanceof Expression) {
          return bindings.concat(value.bindings)
        } else {
          return bindings.concat(value)
        }
      },
      this.bindings,
    );

    return new Condition(expression, bindings);
  }

  equals(target: Value<OutputType>) {
    return this.is('=', target);
  }

  notEquals(target: Value<OutputType>) {
    return this.is('<>', target);
  }

  greaterThan(target: Value<OutputType>) {
    return this.is('>', target);
  }

  greaterThanEqual(target: Value<OutputType>) {
    return this.is('>=', target);
  }

  lessThan(target: Value<OutputType>) {
    return this.is('<', target);
  }

  lessThanEqual(target: Value<OutputType>) {
    return this.is('<=', target);
  }

  like(target: Value<OutputType>) {
    return this.is('LIKE', target);
  }

  notLike(target: Value<OutputType>) {
    return this.is('NOT LIKE', target);
  }

  between(lowerBound: number, upperBound: number) {
    return this.is<number>('BETWEEN', [lowerBound, upperBound]);
  }

  notBetween(lowerBound: number, upperBound: number) {
    return this.is<number>('NOT BETWEEN', [lowerBound, upperBound]);
  }

  in(values: Value<OutputType>[]) {
    return this.is<OutputType>('IN', values);
  }

  notIn(values: Value<OutputType>[]) {
    return this.is<OutputType>('NOT IN', values);
  }

  isNull() {
    return new Condition(`${this.expression} IS NULL`, this.bindings);
  }

  isNotNull() {
    return new Condition(`${this.expression} IS NOT NULL`, this.bindings);
  }

  withSchema<T>(schema: Schema<T>) {
    return new Expression<T, Field>(
      this.expression,
      this.bindings,
      schema,
      this.alias,
    );
  }

  sum() {
    return new Expression<number, 'sum'>(
      `SUM(${this.expression})`,
      this.bindings,
      sumSchema,
      'sum',
    );
  }

  avg() {
    return new Expression<number, 'avg'>(
      `AVG(${this.expression})`,
      this.bindings,
      avgSchema,
      'avg',
    );
  }

  min() {
    return new Expression<number, 'min'>(
      `MIN(${this.expression})`,
      this.bindings,
      minSchema,
      'min',
    );
  }

  max() {
    return new Expression<number, 'max'>(
      `MAX(${this.expression})`,
      this.bindings,
      maxSchema,
      'max',
    );
  }

  count() {
    return new Expression<number, 'count'>(
      `COUNT(${this.expression})`,
      this.bindings,
      countSchema,
      'count',
    );
  }

}

export type AnyExpression = Expression<any, string>;
