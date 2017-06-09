import { Schema, validate } from 'sukima'
import { QueryInterface, QueryBuilder } from 'knex'

import { Extendable } from './extendable'
import { applyMixins } from '../utils/applyMixins'

export type SchemaBuilder<Value> = () => Schema<Value>

export type QueryProps<Value> = {
  schema: Schema<Value>,
}

export interface Sql {
  sql: string
  bindings: any[]
}

export interface QueryConfig {
  validateOutput: boolean,
}

export abstract class Query<Value, Props extends QueryProps<Value>> implements Extendable<Props> {

  /** @internal */
  readonly props: Props

  /** @internal */
  extend: <Keys extends keyof Props>(props: Pick<Props, Keys>) => this

  /** @internal */
  constructor(props: Props) {
    this.props = props
  }

  async execute(query: QueryInterface, config: QueryConfig = { validateOutput: true }): Promise<Value> {
    const raw = this.buildResult(await this.buildQuery(query))

    if (config.validateOutput) {
      return validate(
        this.buildSchema(),
        raw,
        { removeAdditional: true, useDefaults: false, coerce: false },
      ).cata(
        error => { throw error },
        value => value,
      )
    } else {
      return raw
    }
  }

  toSQL(query: QueryInterface): Sql {
    const { sql, bindings } = this.buildQuery(query).toSQL()
    return { sql, bindings }
  }

  /** @internal */
  buildResult(result: any): any {
    return result
  }

  /** @internal */
  protected abstract buildQuery(qb: QueryInterface): QueryBuilder

  /** @internal */
  protected buildSchema(): Schema<Value> {
    return this.props.schema
  }

}

applyMixins(Query, Extendable)
