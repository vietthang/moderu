import 'mocha';
import { assert } from 'chai';
import { object, integer, string } from 'sukima';

import { defineTable } from '../../src/table';
import { Column } from '../../src/column';

it('Should create table correctly', () => {
  interface Pet {
    id: number;
    name: string;
  }

  const petTable = defineTable(
    'Pet',
    object({
      id: integer().minimum(0),
      name: string(),
    }),
    'id',
  );

  assert.equal(petTable.$meta.idAttribute, 'id');
  assert.equal(petTable.$meta.name, 'Pet');
  assert.deepEqual(petTable.$meta.schema, object({
    id: integer().minimum(0),
    name: string(),
  }));

  assert.deepEqual(petTable.id, new Column<Pet, 'id'>(integer().minimum(0), 'id', 'Pet'));
  assert.deepEqual(petTable.name, new Column<Pet, 'name'>(string(), 'name', 'Pet'));
});
