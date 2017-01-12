import { Schema, number, integer, any } from 'sukima';

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
    public readonly field: string | AnyColumn,
    public readonly alias: Field,
    public readonly schema: Schema<Value>,
    public readonly isDistinct: boolean = false,
    public readonly aggregateFunction?: AggregateFunction,
  ) {

  }

  getAlias(): string {
    return '';
  }

  distinct() {
    return new Column<Value, Field>(
      this.field,
      this.alias,
      this.schema,
      this.isDistinct,
      this.aggregateFunction,
    )
  }

  as<Field2 extends string>(alias: Field2) {
    return new Column<Value, Field2>(
      this.field,
      alias,
      this.schema,
      this.isDistinct,
      this.aggregateFunction,
    );
  }

  is(operator: string, target: any | Column<any, string>): any {
    if (target instanceof Column) {
      return new Condition(`?? ${operator} ??`, [this, target]);
    } else {
      return new Condition(`?? ${operator} ?`, [this, target]);
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
    return new Condition('?? IS NULL', [this]);
  }

  isNotNull() {
    return new Condition('?? IS NOT NULL', [this]);
  }

  withSchema<T>(schema: Schema<T>) {
    return new Column<T, Field>(
      this.field,
      this.alias,
      schema,
      this.isDistinct,
      this.aggregateFunction,
    );
  }

  sum() {
    return this.aggregate<'sum'>('sum').withSchema(sumSchema);
  }

  avg() {
    return this.aggregate<'avg'>('avg').withSchema(avgSchema);
  }

  min() {
    return this.aggregate<'min'>('min').withSchema(minSchema);
  }

  max() {
    return this.aggregate<'max'>('max').withSchema(maxSchema);
  }

  count() {
    return this.aggregate<'count'>('count').withSchema(countSchema);
  }

  expression(expression: string, bindings: any[] = []) {
    // return this.
  }

  private aggregate<Operator extends AggregateFunction>(operator: Operator) {
    return new Column<any, Operator>(
      this,
      operator,
      any(),
      this.isDistinct,
      operator,
    );
  }

}

export type AnyColumn = Column<any, string>;