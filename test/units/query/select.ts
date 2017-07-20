import 'mocha'
import * as assert from 'assert'
import Knex = require('knex')

import { petPropertyMap, userPropertyMap, pluginPropertyMap } from '../../common'
import { defineTable } from '../../../src/table'
import { makeJoinedTable } from '../../../src/combinedTable'
import { SelectQuery } from '../../../src/query/select'

const Pet = defineTable({
  name: 'Pet',
  properties: petPropertyMap,
})

const Plugin = defineTable({
  name: 'Plugin',
  properties: pluginPropertyMap,
  parse: (raw) => {
    if (raw.extra) {
      raw = {
        ...raw,
        extra: JSON.parse(raw.extra),
      }
    }

    return raw
  },
})

const PetSelectable = makeJoinedTable(Pet)

const User = defineTable({
  name: 'User',
  properties: userPropertyMap,
})

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

describe('Test BaseSelectQuery class', () => {
  it('Should generate correct select statement with all columns within', () => {
    const query = new SelectQuery(PetSelectable).columnsWithin(Pet)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(
      sql,
      'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet"',
    )
  })

  it('Should generate correct select statement with single column within', () => {
    const query = new SelectQuery(PetSelectable).columnsWithin(Pet, Pet.id)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id" from "Pet"')
  })

  it('Should generate correct select statement with custom expression', () => {
    const query = new SelectQuery(PetSelectable).columns(Pet.id.count().as('count'))
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(sql, 'select COUNT("Pet"."id") AS "count" from "Pet"')
  })

  it('Should generate correct select statement with multiple columns within', () => {
    const query = new SelectQuery(PetSelectable).columnsWithin(Pet, Pet.id, Pet.name)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."name" AS "$_Pet_name" from "Pet"')
  })

  it('Should generate correct select statement with limit', () => {
    const query = new SelectQuery(PetSelectable).limit(10)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [10])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" limit ?')
  })

  it('Should generate correct select statement with offset and limit', () => {
    const query = new SelectQuery(PetSelectable).limit(20).offset(10)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [20, 10])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" limit ? offset ?')
  })

  it('Should generate correct select statement with orderBy', () => {
    const query = new SelectQuery(PetSelectable).orderBy(Pet.name)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" order by "Pet"."name" asc')
  })

  it('Should generate correct select statement with groupBy', () => {
    const query = new SelectQuery(PetSelectable).groupBy(Pet.name)
    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" group by "Pet"."name"')
  })

  it('Should generate correct select statement with where', () => {
    const query = new SelectQuery(PetSelectable)
      .where(Pet.name.equals('Awesome'))

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, ['Awesome'])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" where "Pet"."name" = ?')
  })

  it('Should generate correct select statement with having', () => {
    const query = new SelectQuery(PetSelectable)
      .having(Pet.name.count().equals(10))

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [10])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" having COUNT("Pet"."name") = ?')
  })

  it('Should generate correct select statement with multiple having', () => {
    const query = new SelectQuery(PetSelectable)
      .having(Pet.name.count().equals(10))
      .having(Pet.id.count().equals(10))

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [10, 10])
    assert.equal(sql, 'select "Pet"."id" AS "$_Pet_id", "Pet"."ownerId" AS "$_Pet_ownerId", "Pet"."name" AS "$_Pet_name", "Pet"."updated" AS "$_Pet_updated" from "Pet" having COUNT("Pet"."name") = ? AND (COUNT("Pet"."id") = ?)')
  })

  it('Should generate correct select statement with inner join', () => {
    const combinedTable = Pet.innerJoin(User, Pet.ownerId.equals(User.id))
    const query = new SelectQuery(combinedTable)
      .columnsWithin(Pet, Pet.id)
      .columnsWithin(User, User.id)

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(
      sql,
      'select "Pet"."id" AS "$_Pet_id", "User"."id" AS "$_User_id" from "Pet" inner join "User" "User" ON "Pet"."ownerId" = "User"."id"',
    )
  })

  it('Should generate correct select statement with left join', () => {
    const combinedTable = Pet.leftJoin(User, Pet.ownerId.equals(User.id))
    const query = new SelectQuery(combinedTable)
      .columnsWithin(Pet, Pet.id)
      .columnsWithin(User, User.id)

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(
      sql,
      'select "Pet"."id" AS "$_Pet_id", "User"."id" AS "$_User_id" from "Pet" left join "User" "User" ON "Pet"."ownerId" = "User"."id"',
    )
  })

  it('Should generate correct select statement with right join', () => {
    const combinedTable = Pet.rightJoin(User, Pet.ownerId.equals(User.id))
    const query = new SelectQuery(combinedTable)
      .columnsWithin(Pet, Pet.id)
      .columnsWithin(User, User.id)

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(
      sql,
      'select "Pet"."id" AS "$_Pet_id", "User"."id" AS "$_User_id" from "Pet" right join "User" "User" ON "Pet"."ownerId" = "User"."id"',
    )
  })

  it('Should generate correct select statement with full join', () => {
    const combinedTable = Pet.fullOuterJoin(User, Pet.ownerId.equals(User.id))
    const query = new SelectQuery(combinedTable)
      .columnsWithin(Pet, Pet.id)
      .columnsWithin(User, User.id)

    const { sql, bindings } = query.toSQL(knex)
    assert.deepEqual(bindings, [])
    assert.equal(
      sql,
      'select "Pet"."id" AS "$_Pet_id", "User"."id" AS "$_User_id" from "Pet" full outer join "User" "User" ON "Pet"."ownerId" = "User"."id"',
    )
  })
})

describe('Test SelectQuery buildResult function', () => {
  it('Should build result from raw object fine', () => {
    const query = new SelectQuery(makeJoinedTable(Plugin))
      .columnsWithin(Plugin, Plugin.id, Plugin.name, Plugin.extra)

    const results = query.buildResult([{
      '$_Plugin_id': 1,
      '$_Plugin_name': 'Test',
      '$_Plugin_extra': '{ "foo": "bar" }',
    }])

    assert.deepEqual(results, [
      {
        _: {},
        Plugin: { id: 1, name: 'Test', extra: { foo: 'bar' } },
      },
    ])
  })
})
