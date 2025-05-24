import { ColumnType, Generated, sql } from 'kysely';

import { db } from '../db';

export interface PreparedMessagesTable {
  id: Generated<number>;
  address: string;
  message: string;
  createdAt: ColumnType<Date, string | undefined, never>;
}

export const createPreparedMessagesTable = async () => {
  await db.schema
    .createTable('preparedMessages')
    .ifNotExists()
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('address', 'varchar(255)', (col) => col.notNull())
    .addColumn('message', 'varchar(255)', (col) => col.notNull())
    .addColumn('createdAt', sql`timestamp with time zone`, (cb) =>
      cb.defaultTo(sql`current_timestamp`),
    )
    .execute();
};
