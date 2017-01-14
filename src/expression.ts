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

function getExpression<Type>(value: Value<Type>) {
  if (value instanceof Expression) {
    return value.expression;
  } else {
    return '?';
  }
}

function mergeBindings(bindings: any[], ...values: (Value<any> | Value<any>[])[]) {
  return flatten(values).reduce(
    (bindings, value) => {
      if (value instanceof Expression) {
        return bindings.concat(value.bindings);
      } else {
        return bindings.concat(value);
      }
    },
    bindings,
  );
}

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

  is<Type>(operator: string, value: Value<Type>): Condition {
    const expression = `${this.expression} ${operator} ${getExpression(value)}`;
    const bindings = mergeBindings(this.bindings, value);
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

  between(lowerBound: Value<OutputType>, upperBound: Value<OutputType>) {
    const expression = `${this.expression} BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = mergeBindings(this.bindings, lowerBound, upperBound);
    return new Condition(expression, bindings);
  }

  notBetween(lowerBound: number, upperBound: number) {
    const expression = `${this.expression} NOT BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = mergeBindings(this.bindings, lowerBound, upperBound);
    return new Condition(expression, bindings);
  }

  in(values: Value<OutputType>[]) {
    const expression = `${this.expression} IN (${values.map(getExpression).join(',')})}`;
    const bindings = mergeBindings(this.bindings, values);
    return new Condition(expression, bindings);
  }

  notIn(values: Value<OutputType>[]) {
    const expression = `${this.expression} NOT IN (${values.map(getExpression).join(',')})}`;
    const bindings = mergeBindings(this.bindings, values);
    return new Condition(expression, bindings);
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
