// src/modules/api-keys/api-key.controller.ts

import { noContent, ok } from "../../../core/base/base.controller";
import type { AppCtx } from "../../../types/env";
import { ApiKeyService } from "./api-key.service";

function makeApiKeyService(c: AppCtx) {
  return new ApiKeyService(c.get("db"), c.get("config"), c.get("logger"));
}
export const apiKeyController = {
  async create(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();
    const service = makeApiKeyService(c);
    const result = await service.create({
      userId: auth.sub,
      createdBy: auth.sub,
      name: body.name,
      description: body.description,
      expiresAt: body.expiresAt,
    });

    return ok(c, result);
  },

  async revoke(c: AppCtx) {
    const auth = c.get("auth");
    const { apiKeyId } = c.req.param();

    const service = makeApiKeyService(c);

    await service.revoke(apiKeyId, auth.sub);

    return noContent(c);
  },

  async list(c: AppCtx) {
    const auth = c.get("auth");

    const service = makeApiKeyService(c);

    const keys = await service.listUserKeys(auth.sub);

    return ok(c, keys);
  },
};
