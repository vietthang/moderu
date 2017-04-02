import { string, integer, boolean } from 'sukima'

/** @internal */
export interface Pet {
  id: number,
  ownerId: number,
  name: string,
  updated: number,
}

/** @internal */
export const petPropertyMap = {
  id: integer().minimum(0),
  ownerId: integer().minimum(0),
  name: string(),
  updated: integer(),
}

/** @internal */
export interface User {
  id: number,
  name: string,
  gender: boolean,
  updated: number,
}

/** @internal */
export const userPropertyMap = {
  id: integer().minimum(0),
  name: string(),
  gender: boolean(),
  updated: integer(),
}
