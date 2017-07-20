import 'mocha'
import * as assert from 'assert'
import { QueryInterface, QueryBuilder } from 'knex'
import * as Knex from 'knex'
import { integer } from 'sukima'

import { Query, QueryProps } from '../../../src/query/query'

const mockDb = require('mock-knex')

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

interface MockProps extends QueryProps<number> {
  value: number
}

class MockClass extends Query<number, MockProps> {

  constructor(value: number = 0) {
    super({
      value,
      schema: integer().minimum(0),
      transfomers: [],
    })
  }

  protected buildQuery(qb: QueryInterface): QueryBuilder {
    return qb.select(this.props.value.toString())
  }

}

describe('Test Query class', () => {
  before(() => {
    mockDb.mock(knex)

    const tracker = mockDb.getTracker()

    tracker.install()

    tracker.on('query', (query: any, step: number) => {
      switch (query.sql) {
        case 'select "1"':
          return query.response(1)
        case 'select "-1"':
          return query.response(-1)
      }
    })
  })

  after(() => {
    mockDb.unmock(knex)
  })

  it('Should create new instance build query correctly', async () => {
    const instance = new MockClass(1)
    const { sql, bindings } = instance.toSQL(knex)
    assert.equal(sql, 'select "1"')
    assert.deepEqual(bindings, [])
    const ret = await instance.execute(knex)
    assert.equal(ret, 1)
  })

  it('Should throw if result is invalid value and validate set is true, successed if skip validation', async () => {
    const instance = new MockClass(-1)
    const { sql, bindings } = instance.toSQL(knex)
    assert.equal(sql, 'select "-1"')
    assert.deepEqual(bindings, [])
    try {
      await instance.execute(knex, { validateOutput: true })
      assert(false, 'Validation should be failed')
    } catch (e) {
      assert(e instanceof Error)
    }

    const ret = await instance.execute(knex, { validateOutput: false })
    assert.equal(ret, -1)
  })
})
