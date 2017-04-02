import { AnyExpression } from '../expression'
import { Query, QueryProps } from './query'
import { ConditionalQuery, ConditionalQueryProps } from './conditional'
import { applyMixins } from '../utils/applyMixins'

export type SelectOrderByDirection = 'asc' | 'desc'

export type SelectOrderBy = {
  expression: AnyExpression;
  direction: SelectOrderByDirection;
}

export type BaseSelectQueryProps<Model>
  = QueryProps<Model[]>
  & ConditionalQueryProps
  & {
    orderBys?: SelectOrderBy[];
    groupBys?: AnyExpression[];
    having?: AnyExpression;
    limit?: number;
    offset?: number;
    as?: string;
  }

export abstract class BaseSelectQuery<Model, Props extends BaseSelectQueryProps<Model>>
  extends Query<Model[], Props> implements ConditionalQuery<Props> {

  where: (condition: AnyExpression) => this

  having(condition: AnyExpression): this {
    return this.extend({ having: this.props.having ? this.props.having.and(condition) : condition })
  }

  orderBy(expression: AnyExpression, direction: SelectOrderByDirection): this {
    return this.extend({ orderBys: (this.props.orderBys || []).concat({ expression, direction }) })
  }

  groupBy(expression: AnyExpression): this {
    return this.extend({ groupBys: (this.props.groupBys || []).concat(expression) })
  }

  limit(limit: number): this {
    return this.extend({ limit })
  }

  offset(offset: number): this {
    return this.extend({ offset })
  }

}

applyMixins(BaseSelectQuery, ConditionalQuery)
