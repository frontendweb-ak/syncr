import type { Db } from "../src/types";

import { seedLanguages } from "./languages.seed";
import { seedPermissions } from "./permissions.seed";
import { seedRolePermissions } from "./role-permissions.seed";
import { seedRoles } from "./role.seed";

export async function seedDatabase(db: Db) {
  await seedRoles(db);
  await seedPermissions(db);
  await seedRolePermissions(db);
  await seedLanguages(db);
}
