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
    return value.expression;
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
    public readonly expression: string,
    public readonly bindings: any[],
    public readonly schema: Schema<OutputType>,
    public readonly alias?: Field,
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

  is<Type>(operator: string, value: Value<Type>) {
    const expression = `${this.expression} ${operator} ${getExpression(value)}`;
    const bindings = this.bindings.concat(value);
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
    const expression = `${this.expression} BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = this.bindings.concat(lowerBound, upperBound);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  notBetween(lowerBound: number, upperBound: number) {
    const expression = `${this.expression} NOT BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`;
    const bindings = this.bindings.concat(lowerBound, upperBound);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  in(values: Value<OutputType>[]) {
    const expression = `${this.expression} IN (${values.map(getExpression).join(',')})}`;
    const bindings = this.bindings.concat(values);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  notIn(values: Value<OutputType>[]) {
    const expression = `${this.expression} NOT IN (${values.map(getExpression).join(',')})}`;
    const bindings = this.bindings.concat(values);
    return new Expression<boolean, any>(expression, bindings, conditionSchema);
  }

  isNull() {
    return new Expression<boolean, any>(`${this.expression} IS NULL`, this.bindings, conditionSchema);
  }

  isNotNull() {
    return new Expression(`${this.expression} IS NOT NULL`, this.bindings, conditionSchema);
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
    return new Expression<number | null, 'sum'>(
      `SUM(${this.expression})`,
      this.bindings,
      sumSchema,
      'sum',
    );
  }

  avg() {
    return new Expression<number | null, 'avg'>(
      `AVG(${this.expression})`,
      this.bindings,
      avgSchema,
      'avg',
    );
  }

  min() {
    return new Expression<number | null, 'min'>(
      `MIN(${this.expression})`,
      this.bindings,
      minSchema,
      'min',
    );
  }

  max() {
    return new Expression<number | null, 'max'>(
      `MAX(${this.expression})`,
      this.bindings,
      maxSchema,
      'max',
    );
  }

  count() {
    return new Expression<number | null, 'count'>(
      `COUNT(${this.expression})`,
      this.bindings,
      countSchema,
      'count',
    );
  }

  not() {
    return new Expression<boolean, 'not'>(
      `NOT (${this.expression})`,
      this.bindings,
      conditionSchema,
      'not',
    );
  }

  and(condition: Expression<any, any>) {
    return new Expression<boolean, 'and'>(
      `${this.expression} AND (${condition.expression})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
      'and',
    );
  }

  or(condition: Expression<any, any>) {
    return new Expression<boolean, 'or'>(
      `${this.expression} OR (${condition.expression})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
      'or',
    );
  }

}
