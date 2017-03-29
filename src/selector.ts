// import { Expression } from './expression'

export type Selector<Model, Key extends keyof Model, Name extends string> = {
  meta: {
    name: Name,
    keys: Key[],
  },
}

export function makeSelector<Model, Key extends keyof Model, Name extends string, T>(
  name: Name,
  keys: Key[],
  base: T,
): T & Selector<Model, Key, Name> {
  return Object.assign(
    base,
    {
      meta: {
        name,
        keys,
      },
    },
  )
}
