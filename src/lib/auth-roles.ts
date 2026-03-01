import { createAccessControl } from "better-auth/plugins";
import { adminAc, defaultStatements } from "better-auth/plugins/organization/access";

const statement = {
  specialist: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...defaultStatements,
  specialist: ["read"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  specialist: ["create", "read", "update", "delete"],
});

export const specialist = ac.newRole({
  specialist: ["read", "update"],
});
