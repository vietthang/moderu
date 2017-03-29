/** @internal */
export function mapValues<T, U>(iteratee: (value: T[keyof T], key: keyof T) => U, value: T): { [key in keyof T]: U } {
  const keys = Object.keys(value) as (keyof T)[]

  return keys
    .reduce(
      (obj, key) => {
        return Object.assign(obj, { [key]: iteratee(value[key], key) })
      },
      {} as { [key in keyof T]: U },
    )
}

/** @internal */
export function flatten<T>(values: (T | T[])[]): T[] {
  return values
    .reduce<T[]>(
      (output, value) => output.concat(value),
      [],
    )
}
