import 'mocha';
import 'source-map-support/register';
import { assert } from 'chai';
import { integer, string } from 'sukima';
import Knex = require('knex');

import { defineTable } from '../../../src/table';
import { SelectQuery } from '../../../src/query/select';
import { Expression } from '../../../src/expression';

const petTable = defineTable(
  'Pet',
  {
    id: integer().minimum(0),
    name: string(),
    updated: integer().minimum(0),
    ownerId: integer().minimum(0),
  },
  'id',
);

const userTable = defineTable(
  'User',
  {
    id: integer().minimum(0),
    name: string(),
    updated: integer().minimum(0),
  },
  'id',
);

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

it('Should throw without any column', () => {
  const query = new SelectQuery();
  assert.throw(() => query.toSQL(knex));
});

it('Should generate correct query with simple expression', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(new Expression('1', [], integer(), 'dummy')).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select 1 AS "dummy"', sql);
});

it('Should generate correct query with simple column', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."id" AS "id"', sql);
});

it('Should generate correct query with some columns', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id, petTable.name).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."id" AS "id", "Pet"."name" AS "name"', sql);
});

it('Should generate correct query when pick whole table', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.tableColumns(petTable).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal(
    `select "Pet"."id" AS "id", "Pet"."name" AS "name", "Pet"."updated" AS "updated", "Pet"."ownerId" AS "ownerId"`,
    sql,
  );
});

it('Should generate correct query when using mapping', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.mappedColumns({
    id2: petTable.id,
    name2: petTable.name,
  }).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."id" AS "id2", "Pet"."name" AS "name2"', sql);
});

it('Should generate correct query when chaining columns()', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id).columns(petTable.name).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."id" AS "id", "Pet"."name" AS "name"', sql);
});

it('Should generate correct query when using limit', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id).limit(10).toSQL(knex);
  assert.deepEqual(bindings, [10]);
  assert.equal('select "Pet"."id" AS "id" limit ?', sql);
});

it('Should generate correct query when using offset without limit', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id).offset(10).toSQL(knex);
  assert.deepEqual(bindings, [-1, 10]);
  assert.equal('select "Pet"."id" AS "id" limit ? offset ?', sql);
});

it('Should generate correct query when using offset with limit', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.id).limit(10).offset(10).toSQL(knex);
  assert.deepEqual(bindings, [10, 10]);
  assert.equal('select "Pet"."id" AS "id" limit ? offset ?', sql);
});

it('Should generate correct query when using order', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns(petTable.name).orderBy(petTable.id, 'desc').toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" order by "Pet"."id" desc', sql);
});

it('Should generate correct query when using join', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .join(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" inner join "User" on "Pet"."ownerId" = "User"."id"', sql);
});

it('Should generate correct query when using innerJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .innerJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" inner join "User" on "Pet"."ownerId" = "User"."id"', sql);
});

it('Should generate correct query when using leftJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .leftJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" left join "User" on "Pet"."ownerId" = "User"."id"', sql);
});

it('Should generate correct query when using leftOuterJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .leftOuterJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal(
    'select "Pet"."name" AS "name" from "Pet" left outer join "User" on "Pet"."ownerId" = "User"."id"',
    sql,
  );
});

it('Should generate correct query when using rightJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .rightJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" right join "User" on "Pet"."ownerId" = "User"."id"', sql);
});

it('Should generate correct query when using rightOuterJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .rightOuterJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal(
    'select "Pet"."name" AS "name" from "Pet" right outer join "User" on "Pet"."ownerId" = "User"."id"',
    sql,
  );
});

it('Should generate correct query when using outerJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .outerJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" outer join "User" on "Pet"."ownerId" = "User"."id"', sql);
});

it('Should generate correct query when using fullOuterJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .fullOuterJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal(
    'select "Pet"."name" AS "name" from "Pet" full outer join "User" on "Pet"."ownerId" = "User"."id"',
    sql,
  );
});

it('Should generate correct query when using crossJoin', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .crossJoin(userTable, petTable.ownerId.equals(userTable.id))
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal(
    'select "Pet"."name" AS "name" from "Pet" cross join "User" on "Pet"."ownerId" = "User"."id"',
    sql,
  );
});

it('Should generate correct query when using groupBy', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .from(petTable)
    .groupBy(petTable.ownerId)
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."name" AS "name" from "Pet" group by "Pet"."ownerId"', sql);
});

it('Should generate correct query when using where', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .where(petTable.name.like('Pluto'))
    .toSQL(knex);

  assert.deepEqual(bindings, ['Pluto']);
  assert.equal('select "Pet"."name" AS "name" where "Pet"."name" LIKE ?', sql);
});

it('Should generate correct query when using having', () => {
  const timestamp = new Date(2017, 1, 1).getTime();
  const query = new SelectQuery();
  const { sql, bindings } = query
    .columns(petTable.name)
    .having(petTable.updated.max().greaterThan(timestamp))
    .toSQL(knex);

  assert.deepEqual(bindings, [timestamp]);
  assert.equal('select "Pet"."name" AS "name" having MAX("Pet"."updated") > ?', sql);
});

it('Should generate correct query when using sub query', () => {
  const query = new SelectQuery();
  const subQuery = query
    .columns(userTable.name.as('userName'), userTable.updated.as('userUpdated'))
    .from(userTable)
    .as('Owner');

  const { sql, bindings } = query
    .columns(subQuery.userName)
    .from(subQuery)
    .toSQL(knex);

  assert.deepEqual(bindings, []);
  assert.equal(
    // tslint:disable-next-line:max-line-length
    `select "Owner"."userName" AS "userName" from (select "User"."name" AS "userName", "User"."updated" AS "userUpdated" from "User") as "Owner"`,
    sql,
  );
});

it('Should fail if select with an expression without alias', () => {
  const query = new SelectQuery();
  assert.throw(() => query.columns(petTable.name.equals('Awesome')));
});

it('Should fail if try to generate subQuery without any column', () => {
  const query = new SelectQuery();
  assert.throw(() => query.from(userTable).as('Owner'));
});
