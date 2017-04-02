export interface Selector<Model, Key extends keyof Model, Name extends string> {
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
  const ret = Object.create(base.constructor.prototype)

  return Object.assign(
    ret,
    base,
    {
      meta: {
        name,
        keys,
      },
    },
  )
}
