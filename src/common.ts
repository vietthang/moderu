import { Schema, anyOf, nil, ObjectSchema } from 'sukima'

import { mapValues } from './utils'

export function toPartial<T, Key extends keyof T>(
  key: Key, value: T[Key],
): Partial<T> {
  return {
    [key as any]: value,
  } as any
}

export function toMappedValue<Key extends string, Value>(
  key: Key, value: Value,
): { [key in Key]: Value } {
  return {
    [key as any]: value,
  } as any
}

export type ValueNullable<Model> = {
  [key in keyof Model]: Model[key] | null;
}

export function convertToNullableSchema<T>(
  schema: ObjectSchema<T>,
): ObjectSchema<ValueNullable<T>> {
  return mapValues(
    (schema: Schema<T[keyof T]>, key: keyof T) => {
      return anyOf(schema, nil())
    },
    schema.getPropertyMap() as any,
  )
}
