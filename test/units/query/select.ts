import 'mocha';
import 'source-map-support/register';
import { assert } from 'chai';
import { object, integer, string } from 'sukima';
import Knex = require('knex');

import { defineTable } from '../../../src/table';
import { SelectQuery } from '../../../src/query/select';
import { Expression } from '../../../src/expression';

const petTable = defineTable(
  'Pet',
  object({
    id: integer().minimum(0),
    name: string(),
    updated: integer().minimum(0),
  }),
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
  const { sql, bindings } = query.columns(petTable).toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal('select "Pet"."id" AS "id", "Pet"."name" AS "name", "Pet"."updated" AS "updated"', sql);
});

it('Should generate correct query when using mapping', () => {
  const query = new SelectQuery();
  const { sql, bindings } = query.columns({
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
