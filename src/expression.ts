import { Schema, number, integer, boolean } from 'sukima'

import { flatten } from './utils'

const sumSchema = number().nullable()

const avgSchema = number().nullable()

const minSchema = number().nullable()

const maxSchema = number().nullable()

const countSchema = integer().minimum(0).nullable()

const conditionSchema = boolean()

export type Value<Type> = Type | Expression<Type>

function getExpression<Type>(value: Value<Type>) {
  if (value instanceof Expression) {
    return value.sql
  } else {
    return '?'
  }
}

function getBindings<Type>(value: Value<Type>) {
  if (value instanceof Expression) {
    return value.bindings
  } else {
    return [value]
  }
}

/** @internal */
export interface Bindable {

  bind(isSelect: boolean): string

}

// /** @internal */
// export function equals(lhs: Value<any>, rhs: Value<any>) {
//   return new Expression<boolean>(
//     `${getExpression(lhs)} = ${getExpression(rhs)}`,
//     [...getBindings(lhs), ...getBindings(rhs)],
//     conditionSchema,
//   )
// }

export class Expression<OutputType> {

  /** @internal */
  constructor(
    public readonly sql: string,
    public readonly bindings: any[],
    public readonly schema: Schema<OutputType>,
  ) {

  }

  distinct() {
    return new Expression<OutputType>(
      `DISTINCT(${this.sql})`,
      this.bindings,
      this.schema,
    )
  }

  is<Type>(operator: string, value: Value<Type>) {
    const expression = `${this.sql} ${operator} ${getExpression(value)}`
    const bindings = this.bindings.concat(getBindings(value))
    return new Expression<boolean>(expression, bindings, conditionSchema)
  }

  equals(target: Value<OutputType>) {
    return this.is('=', target)
  }

  notEquals(target: Value<OutputType>) {
    return this.is('<>', target)
  }

  greaterThan(target: Value<OutputType>) {
    return this.is('>', target)
  }

  greaterThanEqual(target: Value<OutputType>) {
    return this.is('>=', target)
  }

  lessThan(target: Value<OutputType>) {
    return this.is('<', target)
  }

  lessThanEqual(target: Value<OutputType>) {
    return this.is('<=', target)
  }

  like(target: Value<OutputType>) {
    return this.is('LIKE', target)
  }

  notLike(target: Value<OutputType>) {
    return this.is('NOT LIKE', target)
  }

  between(lowerBound: Value<OutputType>, upperBound: Value<OutputType>) {
    const expression = `${this.sql} BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`
    const bindings = this.bindings.concat(getBindings(lowerBound), getBindings(upperBound))
    return new Expression<boolean>(expression, bindings, conditionSchema)
  }

  notBetween(lowerBound: number, upperBound: number) {
    const expression = `${this.sql} NOT BETWEEN ${getExpression(lowerBound)} AND ${getExpression(upperBound)}`
    const bindings = this.bindings.concat(getBindings(lowerBound), getBindings(upperBound))
    return new Expression<boolean>(expression, bindings, conditionSchema)
  }

  in(values: Value<OutputType>[]) {
    const expression = `${this.sql} IN (${values.map(getExpression).join(',')})`
    const bindings = this.bindings.concat(flatten(values.map(getBindings)))
    return new Expression<boolean>(expression, bindings, conditionSchema)
  }

  notIn(values: Value<OutputType>[]) {
    const expression = `${this.sql} NOT IN (${values.map(getExpression).join(',')})`
    const bindings = this.bindings.concat(flatten(values.map(getBindings)))
    return new Expression<boolean>(expression, bindings, conditionSchema)
  }

  isNull() {
    return new Expression<boolean>(`${this.sql} IS NULL`, this.bindings, conditionSchema)
  }

  isNotNull() {
    return new Expression(`${this.sql} IS NOT NULL`, this.bindings, conditionSchema)
  }

  withSchema<T>(schema: Schema<T>) {
    return new Expression<T>(
      this.sql,
      this.bindings,
      schema,
    )
  }

  sum() {
    return new Expression<number | null>(
      `SUM(${this.sql})`,
      this.bindings,
      sumSchema,
    )
  }

  avg() {
    return new Expression<number | null>(
      `AVG(${this.sql})`,
      this.bindings,
      avgSchema,
    )
  }

  min() {
    return new Expression<number | null>(
      `MIN(${this.sql})`,
      this.bindings,
      minSchema,
    )
  }

  max() {
    return new Expression<number | null>(
      `MAX(${this.sql})`,
      this.bindings,
      maxSchema,
    )
  }

  count() {
    return new Expression<number | null>(
      `COUNT(${this.sql})`,
      this.bindings,
      countSchema,
    )
  }

  not() {
    return new Expression<boolean>(
      `NOT (${this.sql})`,
      this.bindings,
      conditionSchema,
    )
  }

  and(condition: AnyExpression) {
    return new Expression<boolean>(
      `${this.sql} AND (${condition.sql})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
    )
  }

  or(condition: AnyExpression) {
    return new Expression<boolean>(
      `${this.sql} OR (${condition.sql})`,
      this.bindings.concat(condition.bindings),
      conditionSchema,
    )
  }

}

export type AnyExpression = Expression<any>
