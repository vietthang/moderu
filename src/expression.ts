import { Schema, number, integer, boolean } from 'sukima';

const sumSchema = number().nullable();

const avgSchema = number().nullable();

const minSchema = number().nullable();

const maxSchema = number().nullable();

const countSchema = integer().minimum(0).nullable();

const conditionSchema = boolean();

export type Value<Type> = Type | Expression<Type, string>;

function getExpression<Type>(value: Value<Type>) {
  if (value instanceof Expression) {
    return value.sql;
  } else {
    return '?';
  }
}

function getBindings<Type>(value: Value<Type>) {
  if (value instanceof Expression) {
    return value.bindings;
  } else {
    return [];
  }
}

/** @internal */
export interface Bindable {

  bind(isSelect: boolean): string;

}

/** @internal */
export function equals<T>(lhs: Value<T>, rhs: Value<T>) {
  return new Expression<boolean, any>(
    `${getExpression(lhs)} = ${getExpression(rhs)}`,
    [...getBindings(lhs), ...getBindings(rhs)],
    conditionSchema,
  );
}

export class Expression<OutputType, Field extends string> {

  /** @internal */
  constructor(
    public readonly sql: string,
    public readonly bindings: any[],
    public readonly schema: Schema<OutputType>,
    public readonly alias?: Field,
  ) {

  }

  distinct() {
    return new Expression<OutputType, Field>(
      `DISTINCT(${this.sql})`,
      this.bindings,
      this.schema,
      this.alias,
    );
  }

  as<Field2 extends string>(alias: Field2) {
    return new Expression<OutputType, Field2>(
      this.sql,
      this.bindings,
      this.schema,
      alias,
    );
  }

  is<Type>(operator: string, value: Value<Type>) {
    const expression = `${this.sql} ${operator} ${getExpression(value)}`;
    const bindings = this.bindings.concat(getBindings(value));
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
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
    const expression = `${this.sql} BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = this.bindings.concat(lowerBound, upperBound);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  notBetween(lowerBound: number, upperBound: number) {
    const expression = `${this.sql} NOT BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = this.bindings.concat(lowerBound, upperBound);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  in(values: Value<OutputType>[]) {
    const expression = `${this.sql} IN (${values.map(getExpression).join(',')})}`;
    const bindings = this.bindings.concat(values);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  notIn(values: Value<OutputType>[]) {
    const expression = `${this.sql} NOT IN (${values.map(getExpression).join(',')})}`;
    const bindings = this.bindings.concat(values);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  isNull() {
    return new Expression<boolean, any>(`${this.sql} IS NULL`, this.bindings, conditionSchema);
  }

  isNotNull() {
    return new Expression(`${this.sql} IS NOT NULL`, this.bindings, conditionSchema);
  }

  withSchema<T>(schema: Schema<T>) {
    return new Expression<T, Field>(
      this.sql,
      this.bindings,
      schema,
      this.alias,
    );
  }

  sum() {
    return new Expression<number | null, 'sum'>(
      `SUM(${this.sql})`,
      this.bindings,
      sumSchema,
      'sum',
    );
  }

  avg() {
    return new Expression<number | null, 'avg'>(
      `AVG(${this.sql})`,
      this.bindings,
      avgSchema,
      'avg',
    );
  }

  min() {
    return new Expression<number | null, 'min'>(
      `MIN(${this.sql})`,
      this.bindings,
      minSchema,
      'min',
    );
  }

  max() {
    return new Expression<number | null, 'max'>(
      `MAX(${this.sql})`,
      this.bindings,
      maxSchema,
      'max',
    );
  }

  count() {
    return new Expression<number | null, 'count'>(
      `COUNT(${this.sql})`,
      this.bindings,
      countSchema,
      'count',
    );
  }

  not() {
    return new Expression<boolean, 'not'>(
      `NOT (${this.sql})`,
      this.bindings,
      conditionSchema,
      'not',
    );
  }

  and(condition: Expression<any, any>) {
    return new Expression<boolean, 'and'>(
      `${this.sql} AND (${condition.sql})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
      'and',
    );
  }

  or(condition: Expression<any, any>) {
    return new Expression<boolean, 'or'>(
      `${this.sql} OR (${condition.sql})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
      'or',
    );
  }

}
