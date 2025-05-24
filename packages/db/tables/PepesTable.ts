import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface PepesTable {
  id: Generated<number>;
  imageUrl?: string | null;
  isApproved?: boolean;
  isLocked?: boolean;
  metadataUrl?: string | null;
  status?: string;
  originalPepeId?: number;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createPepesTable = async () => {
  await db.schema
    .createTable('pepes')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('imageUrl', 'varchar(255)')
    .addColumn('isApproved', 'boolean', (cb) => cb.defaultTo(false))
    .addColumn('isLocked', 'boolean', (cb) => cb.defaultTo(false))
    .addColumn('metadataUrl', 'varchar(255)')
    .addColumn('status', 'varchar(255)', (cb) => cb.notNull().defaultTo('active'))
    .addColumn('originalPepeId', 'integer')
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
