import { QueryInterface, Raw } from 'knex'

/** @internal */
export function makeKnexRaw (query: QueryInterface, sql: string, bindings: any[], isSelect: boolean): Raw {
  const client = (query as any).client

  const finalBindings = bindings.map((binding) => {
    if (typeof binding.bind === 'function') {
      return binding.bind(isSelect)
    }

    return binding
  })

  return client.raw(sql, finalBindings) as Raw
}
