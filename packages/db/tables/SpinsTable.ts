import { ColumnType, sql } from 'kysely';

import { db } from '../db';

export interface SpinsTable {
  address: string;
  pepeId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createSpinsTable = async () => {
  await db.schema
    .createTable('spins')
    .ifNotExists()
    .addColumn('address', 'varchar(255)', (cb) => cb.notNull())
    .addColumn('pepeId', 'integer', (cb) => cb.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
