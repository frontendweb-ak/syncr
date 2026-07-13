// src/modules/registry/component/component.route.ts

import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import type { AppContext } from "../../types/env";
import { componentController } from "./component.controller";

// import { CreateComponentSchema, UpdateComponentSchema, DeprecateComponentSchema } from "@syncr/validator";
// ^ TODO: add these three schemas to @syncr/validator, following the
// shape of CreateComponentInput / update payload / { note: string }.
// Publish is multipart (file upload), so it's validated by hand in the
// controller rather than through the Zod middleware — same reasoning as
// any other file-upload endpoint you may already have.

const component = new Hono<AppContext>();

component.use("*", authMiddleware); // every registry route requires auth — no public read in MVP, even for isPublic components (that's a marketplace-tier concern, deferred per BRD §8)

component.post("/", componentController.create);
component.get("/", componentController.list);
component.get("/:slug", componentController.get);
component.patch("/:slug", componentController.update);
component.post("/:slug/deprecate", componentController.deprecate);
component.delete("/:slug", componentController.remove);

component.post("/:slug/versions", componentController.publish);
component.get("/:slug/versions", componentController.listVersions);
component.get("/:slug/versions/:version", componentController.getVersion);

export { component as componentRoutes };
