export function flatten<T> (array: T[][]): T[] {
  return array.reduce<T[]>(
    (prevValue, element) => prevValue.concat(element),
    [],
  )
}
