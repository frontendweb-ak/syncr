import { ErrorCode } from "../codes";
import { ConflictException } from "../conflict.error";
import { HttpException } from "../exceptions";
import { ForbiddenException } from "../forbidden.error";
import { NotFoundException } from "../not-found.error";

export const rbacErrors = {
  role: {
    notFound: () => new NotFoundException("Role", ErrorCode.ROLE_NOT_FOUND),

    alreadyExists: () =>
      new ConflictException(
        "Role already exists",
        ErrorCode.ROLE_ALREADY_EXISTS,
      ),

    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.ROLE_CREATE_FAILED,
        "Failed to create role",
      ),

    updateFailed: () =>
      new HttpException(
        500,
        ErrorCode.ROLE_UPDATE_FAILED,
        "Failed to update role",
      ),

    deleteFailed: () =>
      new HttpException(
        500,
        ErrorCode.ROLE_DELETE_FAILED,
        "Failed to delete role",
      ),

    systemProtected: () =>
      new ForbiddenException(
        "System roles cannot be modified or deleted",
        ErrorCode.ROLE_SYSTEM_PROTECTED,
      ),
  },

  permission: {
    notFound: () =>
      new NotFoundException("Permission", ErrorCode.PERMISSION_NOT_FOUND),

    alreadyExists: () =>
      new ConflictException(
        "Permission already exists",
        ErrorCode.PERMISSION_ALREADY_EXISTS,
      ),

    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.PERMISSION_CREATE_FAILED,
        "Failed to create permission",
      ),

    updateFailed: () =>
      new HttpException(
        500,
        ErrorCode.PERMISSION_UPDATE_FAILED,
        "Failed to update permission",
      ),

    deleteFailed: () =>
      new HttpException(
        500,
        ErrorCode.PERMISSION_DELETE_FAILED,
        "Failed to delete permission",
      ),
  },

  rolePermission: {
    alreadyExists: () =>
      new ConflictException(
        "Permission already assigned to role",
        ErrorCode.ROLE_PERMISSION_ALREADY_EXISTS,
      ),

    notFound: () =>
      new NotFoundException(
        "Role permission",
        ErrorCode.ROLE_PERMISSION_NOT_FOUND,
      ),
  },

  userRole: {
    alreadyExists: () =>
      new ConflictException(
        "Role already assigned to user",
        ErrorCode.USER_ROLE_ALREADY_EXISTS,
      ),

    notFound: () =>
      new NotFoundException("User role", ErrorCode.USER_ROLE_NOT_FOUND),
  },
} as const;
