import 'mocha'
import * as assert from 'assert'
import Knex = require('knex')

import { petPropertyMap } from '../../common'
import { defineTable } from '../../../src/table'
import { DeleteQuery } from '../../../src/query/delete'

const petTable = defineTable(
  'Pet',
  petPropertyMap,
  'id',
)

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

it('Should generate simple delete statement correctly', () => {
  const query = new DeleteQuery(petTable)
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [])
  assert.equal('delete from "Pet"', sql)
})

it('Should generate delete statement correctly with condition', () => {
  const query = new DeleteQuery(petTable).where(petTable.id.equals(1))
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [1])
  assert.equal('delete from "Pet" where "id" = ?', sql)
})

it('Should generate delete statement correctly with complex condition', () => {
  const query = new DeleteQuery(petTable).where(petTable.id.equals(1)).where(petTable.name.equals('abc'))
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [1, 'abc'])
  assert.equal('delete from "Pet" where "id" = ? AND ("name" = ?)', sql)
})
