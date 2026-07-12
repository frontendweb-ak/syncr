// ─────────────────────────────────────────────────────────────────
// errors/catalog/workspace.errors.ts
// Domains: organization · project · provider · workspace
// ─────────────────────────────────────────────────────────────────
import { BadRequestException } from "../bad-request.error";
import { ErrorCode } from "../codes";
import { ConflictException } from "../conflict.error";
import { HttpException } from "../exceptions";
import { ForbiddenException } from "../forbidden.error";
import { NotFoundException } from "../not-found.error";

export const workspaceErrors = {
  organization: {
    cannotRemoveOwner: () =>
      new ConflictException(
        "Transfer ownership before removing this member",
        ErrorCode.ORG_CANNOT_REMOVE_OWNER,
      ),
    notAMember: () =>
      new ForbiddenException(
        "You are not a member of this organization",
        ErrorCode.ORG_NOT_A_MEMBER,
      ),
    systemRoleMissing: (slug: string) =>
      new HttpException(
        500,
        ErrorCode.ORG_SYSTEM_ROLE_MISSING,
        `System role "${slug}" is missing from seed data`,
      ),
    slugTaken: () =>
      new ConflictException(
        "That organization slug is already in use",
        ErrorCode.ORG_SLUG_TAKEN,
      ),
    notFound: () =>
      new NotFoundException("Organization", ErrorCode.ORGANIZATION_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        "Organization already exists",
        ErrorCode.ORGANIZATION_ALREADY_EXISTS,
      ),
    accessDenied: () =>
      new ForbiddenException(
        "You do not have access to this organization",
        ErrorCode.ORGANIZATION_ACCESS_DENIED,
      ),
    inviteNotFound: () =>
      new NotFoundException("Invite", ErrorCode.ORG_INVITE_NOT_FOUND),
    inviteExpired: () =>
      new BadRequestException(
        "This invite has expired",
        ErrorCode.ORG_INVITE_EXPIRED,
      ),
    inviteAlreadyAccepted: () =>
      new ConflictException(
        "This invite has already been accepted",
        ErrorCode.ORG_INVITE_ALREADY_ACCEPTED,
      ),
    memberNotFound: () =>
      new NotFoundException("Member", ErrorCode.ORG_MEMBER_NOT_FOUND),
    memberAlreadyExists: () =>
      new ConflictException(
        "This user is already a member of the organization",
        ErrorCode.ORG_MEMBER_ALREADY_EXISTS,
      ),
    memberLastOwner: () =>
      new BadRequestException(
        "An organization must have at least one owner",
        ErrorCode.ORG_MEMBER_LAST_OWNER,
      ),
    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.ORGANIZATION_CREATE_FAILED,
        "Organization creation failed",
      ),
    memberCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.ORG_MEMBER_CREATE_FAILED,
        "Organization member created failed",
      ),

    workspaceCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.ORG_WORKSPACE_CREATE_FAILED,
        "Organization workspace created failed",
      ),

    inviteCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.ORGANIZATION_INVITE_CREATE_FAILED,
        "Organization invite creation failed",
      ),
  },

  project: {
    notFound: () =>
      new NotFoundException("Project", ErrorCode.PROJECT_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        "Project already exists",
        ErrorCode.PROJECT_ALREADY_EXISTS,
      ),
    accessDenied: () =>
      new ForbiddenException(
        "You do not have access to this project",
        ErrorCode.PROJECT_ACCESS_DENIED,
      ),
    memberNotFound: () =>
      new NotFoundException("Member", ErrorCode.PROJECT_MEMBER_NOT_FOUND),
    memberAlreadyExists: () =>
      new ConflictException(
        "This user is already a member of the project",
        ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS,
      ),
    environmentNotFound: () =>
      new NotFoundException(
        "Environment",
        ErrorCode.PROJECT_ENVIRONMENT_NOT_FOUND,
      ),
    environmentAlreadyExists: () =>
      new ConflictException(
        "An environment with this name already exists",
        ErrorCode.PROJECT_ENVIRONMENT_ALREADY_EXISTS,
      ),
    environmentVariableNotFound: () =>
      new NotFoundException(
        "Environment variable",
        ErrorCode.ENVIRONMENT_VARIABLE_NOT_FOUND,
      ),
    environmentSecretNotFound: () =>
      new NotFoundException(
        "Environment secret",
        ErrorCode.ENVIRONMENT_SECRET_NOT_FOUND,
      ),
  },

  provider: {
    connectionNotFound: () =>
      new NotFoundException(
        "Provider connection",
        ErrorCode.PROVIDER_CONNECTION_NOT_FOUND,
      ),
    connectionAlreadyExists: () =>
      new ConflictException(
        "A connection to this provider already exists",
        ErrorCode.PROVIDER_CONNECTION_ALREADY_EXISTS,
      ),
    connectionInvalid: () =>
      new BadRequestException(
        "Provider connection is invalid or has been revoked",
        ErrorCode.PROVIDER_CONNECTION_INVALID,
      ),
    repositoryNotFound: () =>
      new NotFoundException("Repository", ErrorCode.REPOSITORY_NOT_FOUND),
    repositoryAlreadyLinked: () =>
      new ConflictException(
        "This repository is already linked",
        ErrorCode.REPOSITORY_ALREADY_LINKED,
      ),
    repositoryAccessDenied: () =>
      new ForbiddenException(
        "You do not have access to this repository",
        ErrorCode.REPOSITORY_ACCESS_DENIED,
      ),
  },

  workspace: {
    notFound: () =>
      new NotFoundException("Workspace", ErrorCode.WORKSPACE_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        "Workspace already exists",
        ErrorCode.WORKSPACE_ALREADY_EXISTS,
      ),
    accessDenied: () =>
      new ForbiddenException(
        "You do not have access to this workspace",
        ErrorCode.WORKSPACE_ACCESS_DENIED,
      ),
    limitExceeded: (limit: number) =>
      new ConflictException(
        `Maximum ${limit} workspaces allowed`,
        ErrorCode.WORKSPACE_LIMIT_EXCEEDED,
      ),
  },
} as const;