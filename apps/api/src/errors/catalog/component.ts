// errors/catalog/component.ts

import { HttpException } from "../exceptions";

export const componentErrors = {
  component: {
    // Component
    notFound: () =>
      new HttpException(404, "COMPONENT_NOT_FOUND", "Component not found."),

    alreadyExists: () =>
      new HttpException(
        409,
        "COMPONENT_ALREADY_EXISTS",
        "Component already exists.",
      ),

    slugTaken: () =>
      new HttpException(
        409,
        "COMPONENT_SLUG_TAKEN",
        "Component slug is already in use.",
      ),

    createFailed: () =>
      new HttpException(
        500,
        "COMPONENT_CREATE_FAILED",
        "Failed to create component.",
      ),

    updateFailed: () =>
      new HttpException(
        500,
        "COMPONENT_UPDATE_FAILED",
        "Failed to update component.",
      ),

    deleteFailed: () =>
      new HttpException(
        500,
        "COMPONENT_DELETE_FAILED",
        "Failed to delete component.",
      ),

    deprecateFailed: () =>
      new HttpException(
        500,
        "COMPONENT_DEPRECATE_FAILED",
        "Failed to deprecate component.",
      ),

    deprecated: () =>
      new HttpException(
        410,
        "COMPONENT_DEPRECATED",
        "This component has been deprecated.",
      ),

    deprecationNoteRequired: () =>
      new HttpException(
        400,
        "COMPONENT_DEPRECATION_NOTE_REQUIRED",
        "Deprecation note is required.",
      ),

    hasActiveConsumers: (count: number) =>
      new HttpException(
        409,
        "COMPONENT_HAS_ACTIVE_CONSUMERS",
        `Component is currently used by ${count} repositories.`,
      ),

    invalidVersion: (version: string) =>
      new HttpException(
        400,
        "COMPONENT_INVALID_VERSION",
        `Invalid semantic version: ${version}.`,
      ),

    noopRepublish: (existingVersion: string) =>
      new HttpException(
        409,
        "COMPONENT_NOOP_REPUBLISH",
        `This package content already exists in version ${existingVersion}.`,
      ),

    versionNotGreater: (incomingVersion: string, latestVersion: string) =>
      new HttpException(
        409,
        "COMPONENT_VERSION_NOT_GREATER",
        `Version ${incomingVersion} must be greater than ${latestVersion}.`,
      ),

    // Component Version
    versionNotFound: (version?: string) =>
      new HttpException(
        404,
        "COMPONENT_VERSION_NOT_FOUND",
        version
          ? `Component version ${version} not found.`
          : "Component version not found.",
      ),

    versionAlreadyExists: () =>
      new HttpException(
        409,
        "COMPONENT_VERSION_ALREADY_EXISTS",
        "Component version already exists.",
      ),

    versionCreateFailed: () =>
      new HttpException(
        500,
        "COMPONENT_VERSION_CREATE_FAILED",
        "Failed to create component version.",
      ),

    versionUpdateFailed: () =>
      new HttpException(
        500,
        "COMPONENT_VERSION_UPDATE_FAILED",
        "Failed to update component version.",
      ),

    versionDeleteFailed: () =>
      new HttpException(
        500,
        "COMPONENT_VERSION_DELETE_FAILED",
        "Failed to delete component version.",
      ),

    versionPublishFailed: () =>
      new HttpException(
        500,
        "COMPONENT_VERSION_PUBLISH_FAILED",
        "Failed to publish component version.",
      ),
  },
};
