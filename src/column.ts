import { PropertyMap } from 'sukima'

import { Selector, makeSelector } from './selector'
import { Expression, Bindable } from './expression'

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
  const expression = new Expression<Model[Key]>('??', [new ColumnBinding(key, name)], propertyMap[key])

  return makeSelector<Model, Key, Name, typeof expression>(
    name,
    [key],
    expression,
  )
}
