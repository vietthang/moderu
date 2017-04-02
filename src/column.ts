import { PropertyMap } from 'sukima'

import { Selector, makeSelector } from './selector'
import { Expression, Bindable, AnyExpression } from './expression'

/** @internal */
export class ColumnBinding implements Bindable {

  constructor(
    private readonly field: string,
    private readonly dataSetName: string,
  ) {

  }

  bind(isSelect: boolean): string {
    if (isSelect) {
      return `${this.dataSetName}.${this.field}`
    } else {
      return this.field
    }
  }

}

export type Column<Model, Key extends keyof Model, Name extends string>
  = Expression<Model[Key]>
  & Selector<Model, Key, Name>

export function makeColumn<Model, Key extends keyof Model, Name extends string>(
  propertyMap: PropertyMap<Model>,
  key: Key,
  name: Name,
): Column<Model, Key, Name> {
  return makeSelector<Model, Key, Name, AnyExpression>(
    name,
    [key],
    new Expression<Model[Key]>('??', [new ColumnBinding(key, name)], propertyMap[key]),
  )
}
