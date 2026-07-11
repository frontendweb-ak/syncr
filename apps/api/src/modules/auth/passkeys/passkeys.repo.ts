import { passkeys } from "@syncr/db";

import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";

export type Passkey = InferSelectModel<typeof passkeys>;
export type NewPasskey = InferInsertModel<typeof passkeys>;

export class PasskeyRepo extends BaseRepo {
  async create(input: NewPasskey) {
    const [passkey] = await this.db.insert(passkeys).values(input).returning();

    return passkey;
  }

  async findById(id: string) {
    const [passkey] = await this.db
      .select()
      .from(passkeys)
      .where(eq(passkeys.id, id))
      .limit(1);

    return passkey ?? null;
  }

  async findByCredentialId(credentialId: string) {
    const [passkey] = await this.db
      .select()
      .from(passkeys)
      .where(eq(passkeys.credentialId, credentialId))
      .limit(1);

    return passkey ?? null;
  }

  async findByUserId(userId: string) {
    return this.db.select().from(passkeys).where(eq(passkeys.userId, userId));
  }

  async updateCounter(id: string, counter: number) {
    await this.db
      .update(passkeys)
      .set({
        counter,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(passkeys.id, id));
  }

  async rename(id: string, name: string) {
    await this.db
      .update(passkeys)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(passkeys.id, id));
  }

  async delete(id: string) {
    await this.db.delete(passkeys).where(eq(passkeys.id, id));
  }
}
