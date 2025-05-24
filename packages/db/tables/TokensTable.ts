import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface TokensTable {
  id: Generated<number>;
  pepeId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createTokensTable = async () => {
  await db.schema
    .createTable('tokens')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('pepeId', 'integer', (cb) => cb.notNull().unique())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
