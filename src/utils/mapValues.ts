export function mapValues<T, K extends keyof T>(
  source: T,
  functor: (value: T[K], key: K) => any,
): any {
  return Object
    .keys(source)
    .map((key: K) => [functor(source[key], key), key] as [any, K])
    .reduce(
      (prevValue, [value, key]) => {
        return {
          ...prevValue,
          [key as any]: value,
        };
      },
      {} as any,
    );
}
