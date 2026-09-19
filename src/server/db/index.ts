import { drizzle } from 'drizzle-orm/neon-http';

import * as appSchema from '@/server/db/app-schema';
import * as authSchema from '@/server/db/auth-schema';
import { getServerEnv } from '@/server/env';

function createDatabase() {
  return drizzle(getServerEnv().DATABASE_URL, {
    schema: { ...authSchema, ...appSchema },
  });
}

export type Database = ReturnType<typeof createDatabase>;

let database: Database | undefined;

export function getDatabase() {
  database ??= createDatabase();
  return database;
}
