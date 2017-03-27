import { Schema, validate } from 'sukima'
import { QueryInterface, QueryBuilder } from 'knex'
import { Extendable } from './extendable'

export type QueryProps<Value> = {
  schema: Schema<Value>;
}

export interface Sql {
  sql: string
  bindings: any[]
}

export abstract class Query<Value, Props extends QueryProps<Value>> implements Extendable<Props> {

  /** @internal */
  readonly props: Props

  /** @internal */
  constructor (props: Props) {
    this.props = props
  }

  public extend<Keys extends keyof Props>(props: Pick<Props, Keys>): this {
    return Object.assign(
      Object.create(this.constructor.prototype),
      this,
      {
        props: {
          ...this.props as any,
          ...props as any,
        },
      },
    )
  }

  async execute (query: QueryInterface): Promise<Value> {
    const raw = await this.buildQuery(query)
    return await validate(this.props.schema, raw)
  }

  toSQL (query: QueryInterface): Sql {
    const { sql, bindings } = this.buildQuery(query).toSQL()
    return { sql, bindings }
  }

  /** @internal */
  protected abstract buildQuery (qb: QueryInterface): QueryBuilder;

}
