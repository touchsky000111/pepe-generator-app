import { ColumnType, sql } from 'kysely';

import { db } from '../db';

export interface LockedPepesTable {
  address: string;
  pepeId: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createLockedPepesTable = async () => {
  await db.schema
    .createTable('lockedPepes')
    .ifNotExists()
    .addColumn('address', 'varchar(255)', (cb) => cb.notNull().unique())
    .addColumn('pepeId', 'integer', (cb) => cb.notNull().unique())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
