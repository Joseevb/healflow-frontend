import { parseArgs } from "node:util";
import { reset, seed } from "drizzle-seed";
import { db } from "../db";
import { accounts, users } from "./schemas";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    reset: { type: "boolean" },
  },
  strict: true,
  allowPositionals: true,
});

async function main() {
  if (values.reset) {
    await reset(db, { users, accounts });
  }

  await seed(db, { users, accounts }).refine((f) => ({
    users: {
      count: 10,
      columns: {
        id: f.uuid(),
        name: f.fullName(),
        email: f.email(),
        emailVerified: f.boolean(),
      },
    },
  }));
}

main();
