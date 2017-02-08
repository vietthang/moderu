import 'mocha';
// import { assert } from 'chai';
import { object, integer, string } from 'sukima';
import Knex = require('knex');

import { defineTable } from '../src/table';

import { select } from '../src';

const Pet = defineTable(
  'Pet',
  object({
    id: integer().minimum(0),
    name: string(),
    name2: string(),
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

select()
  .columns(Pet.id.as('wtfID'), Pet.name, Pet.updated.count().as('count2')).from(Pet)
  // .where(Pet.id.equals(2))
  .where(Pet.name.equals(Pet.name2))
  .execute(knex)
  .then((pets) => {

  });
