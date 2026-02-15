import { migrate } from "drizzle-orm/bun-sqlite/migrator";

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

try {
  const sqlite = new Database(process.env.DB_FILE_NAME);
  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrations completed");
} catch (error) {
  console.error("Migration failed:", error);
}
