import { Schema, validate } from 'sukima'

import { Column } from '../column'
import { Expression } from '../expression'
import { Extendable } from './extendable'
import { applyMixins } from '../utils/applyMixins'

export type ModificationModel<Model> = Partial<{ [K in keyof Model]: (Expression<Model[K], any> | Model[K]) }>

export enum ValidationMode {
  SkipExpressions = 0,
  DisallowExpressions,
  Disabled ,
}

export type ModificationQueryProps<Model> = {
  model?: ModificationModel<Model>;
  validationMode: ValidationMode;
  inputSchema: Schema<Partial<Model>>;
}

function validateSkipExpressions<Model> (
  schema: Schema<Partial<Model>>,
  model: ModificationModel<Model>,
): ModificationModel<Model> {
  const valueModel = Object
    .keys(model)
    .filter(key => !(model[key as any] instanceof Expression))
    .reduce(
      (prevValue, key) => {
        return {
          ...prevValue,
          [key]: model[key as any],
        }
      },
      {},
    )

  const expressionModel = Object
    .keys(model)
    .filter(key => model[key as any] instanceof Expression)
    .reduce(
      (prevValue, key) => {
        return {
          ...prevValue,
          [key]: model[key as any],
        }
      },
      {},
    )

  const { value, error } = validate(schema, valueModel)
  if (error) {
    throw error
  }

  return {
    ...value as any,
    ...expressionModel,
  } as ModificationModel<Model>
}

function validateDisallowExpressions<Model> (
  schema: Schema<Partial<Model>>,
  model: ModificationModel<Model>,
): ModificationModel<Model> {
  const keys = Object.keys(model) as (keyof Model)[]
  if (keys.find(key => model[key] instanceof Expression)) {
    throw new Error('Expression is not allowed.')
  }

  const { error, value } = validate(schema, model)
  if (error) {
    throw error
  } else {
    return value!
  }
}

export class ModificationQuery<Model, Props extends ModificationQueryProps<Model>> implements Extendable<Props> {

  /** @internal */
  readonly props: Props

  /** @internal */
  extend: <Keys extends keyof Props>(props: Pick<Props, Keys>) => this

  validationMode (validationMode: ValidationMode) {
    return this.extend({
      validationMode,
    })
  }

  value (model: ModificationModel<Model>): this {
    let finalModel: ModificationModel<Model>

    switch (this.props.validationMode) {
      case ValidationMode.SkipExpressions:
        finalModel = validateSkipExpressions(this.props.inputSchema, model)
        break
      case ValidationMode.DisallowExpressions:
        finalModel = validateDisallowExpressions(this.props.inputSchema, model)
        break
      case ValidationMode.Disabled:
        finalModel = model
        break
      default:
        throw new Error('Invalid validation mode')
    }

    return this.extend({
      model: finalModel,
    })
  }

  set<K extends keyof Model> (
    column: K | Column<Model, K>,
    value: Model[K] | Expression<Model[K], string>,
  ): this {
    if (column instanceof Column) {
      return this.value({ [column.alias as string]: value } as any)
    } else {
      return this.value({ [column as string]: value } as any)
    }
  }

}

applyMixins(ModificationQuery, Extendable)
