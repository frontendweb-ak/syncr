CREATE TYPE "public"."audit_action" AS ENUM('ORG_UPDATED', 'ORG_DELETED', 'MEMBER_INVITED', 'MEMBER_REMOVED', 'MEMBER_ROLE_UPDATED', 'REPO_CONNECTED', 'REPO_DISCONNECTED', 'COMPONENT_PUBLISHED', 'COMPONENT_DEPRECATED', 'COMPONENT_DELETED', 'SYNC_APPROVED', 'SYNC_REJECTED', 'SYNC_BULK_APPROVED', 'VULNERABILITY_DISMISSED', 'VULNERABILITY_PATCHED', 'TOKEN_CREATED', 'TOKEN_REVOKED', 'WEBHOOK_UPDATED');--> statement-breakpoint
CREATE TYPE "public"."audit_resource_type" AS ENUM('USER', 'ORGANIZATION', 'ORGANIZATION_MEMBER', 'INVITATION', 'PROJECT', 'WORKSPACE', 'PROVIDER_CONNECTION', 'REPOSITORY', 'COMPONENT', 'COMPONENT_VERSION', 'SYNC_PROPOSAL', 'API_KEY', 'WEBHOOK', 'SETTING', 'AUTH', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."api_key_status" AS ENUM('ACTIVE', 'REVOKED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."api_key_type" AS ENUM('PERSONAL', 'ORGANIZATION');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('PASSWORD', 'GITHUB', 'GOOGLE', 'MICROSOFT', 'APPLE', 'OIDC', 'SAML', 'PASSKEY');--> statement-breakpoint
CREATE TYPE "public"."device_status" AS ENUM('ACTIVE', 'REVOKED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."device_type" AS ENUM('IOS', 'TABLET', 'ANDROID', 'WEB', 'DESKTOP');--> statement-breakpoint
CREATE TYPE "public"."impersonation_status" AS ENUM('ACTIVE', 'ENDED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."login_failure_reason" AS ENUM('INVALID_CREDENTIALS', 'INVALID_OTP', 'ACCOUNT_SUSPENDED', 'ACCOUNT_NOT_VERIFIED', 'ACCOUNT_LOCKED', 'RATE_LIMITED', 'PROVIDER_ERROR', 'EAMIL_NOT_VERIFIED');--> statement-breakpoint
CREATE TYPE "public"."login_method" AS ENUM('PASSWORD', 'EMAIL_OTP', 'PHONE_OTP', 'GOOGLE', 'APPLE', 'GITHUB', 'MICROSOFT', 'PASSKEY');--> statement-breakpoint
CREATE TYPE "public"."mfa_type" AS ENUM('TOTP');--> statement-breakpoint
CREATE TYPE "public"."password_reset_token_status" AS ENUM('PENDING', 'USED', 'EXPIRED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."platform_role" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."security_event_type" AS ENUM('NEW_DEVICE_LOGIN', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET', 'EMAIL_CHANGED', 'PHONE_CHANGED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_ACTIVATED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'DEVICE_REVOKED', 'ALL_DEVICES_REVOKED', 'TOKEN_VERSION_BUMPED', 'SUSPICIOUS_LOGIN_BLOCKED', 'MFA_ENABLED', 'MFA_DISABLED');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."component_framework" AS ENUM('REACT', 'VUE', 'SVELTE', 'ANGULAR', 'SOLID', 'UNIVERSAL');--> statement-breakpoint
CREATE TYPE "public"."organizationInvite_status" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED');--> statement-breakpoint
CREATE TYPE "public"."organizationMember_status" AS ENUM('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');--> statement-breakpoint
CREATE TYPE "public"."organization_plan" AS ENUM('FREE', 'PRO', 'TEAM', 'BUSINESS', 'ENTERPRISE');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."environment_variables_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."environment_variables_type" AS ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON');--> statement-breakpoint
CREATE TYPE "public"."project_environment_status" AS ENUM('ACTIVE', 'ARCHIVED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."project_environment_type" AS ENUM('DEVELOPMENT', 'TEST', 'QA', 'STAGING', 'PRODUCTION', 'PREVIEW', 'CUSTOM');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('ACTIVE', 'ARCHIVED', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('PRIVATE', 'INTERNAL', 'PUBLIC');--> statement-breakpoint
CREATE TYPE "public"."provider_connection_status" AS ENUM('CONNECTED', 'DISCONNECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('GITHUB', 'GITLAB', 'BITBUCKET', 'AZURE_DEVOPS');--> statement-breakpoint
CREATE TYPE "public"."repository_role" AS ENUM('SOURCE', 'CONSUMER');--> statement-breakpoint
CREATE TYPE "public"."repository_status" AS ENUM('ACTIVE', 'ARCHIVED', 'DISCONNECTED', 'DELETED', 'SYNCING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."repository_visibility" AS ENUM('PRIVATE', 'INTERNAL', 'PUBLIC');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."sync_event_type" AS ENUM('PROPOSED', 'PR_OPENED', 'PR_MERGED', 'PR_CLOSED', 'APPROVED', 'REJECTED', 'CONFLICT', 'ROLLBACK');--> statement-breakpoint
CREATE TYPE "public"."sync_proposal_type" AS ENUM('UPDATE', 'ROLLBACK', 'SECURITY', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('PENDING', 'GENERATING_PR', 'PR_OPENED', 'APPROVED', 'MERGED', 'REJECTED', 'CONFLICT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vulnerability_status" AS ENUM('OPEN', 'PATCHED', 'DISMISSED', 'FALSE_POSITIVE');--> statement-breakpoint
CREATE TYPE "public"."workspace_status" AS ENUM('ACTIVE', 'ARCHIVED', 'SUSPENDED', 'DELETED');--> statement-breakpoint
CREATE TYPE "public"."sync_actor_type" AS ENUM('USER', 'SYSTEM', 'PROVIDER');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"audit_log_id" bigserial PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"action" "audit_action" NOT NULL,
	"resource_type" "audit_resource_type" NOT NULL,
	"resource_id" text NOT NULL,
	"resource_name" text,
	"before" jsonb,
	"after" jsonb,
	"metadata" jsonb,
	"ip_address" text,
	"user_agent" text,
	"request_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_auth_providers" (
	"user_auth_provider_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "auth_provider" NOT NULL,
	"provider_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_credentials" (
	"auth_credential_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" text NOT NULL,
	"password_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"must_reset_password" boolean DEFAULT false NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_type" "mfa_type",
	"mfa_secret_encrypted" text,
	"mfa_pending_secret_encrypted" text,
	"mfa_pending_expires_at" timestamp with time zone,
	"mfa_recovery_codes_encrypted" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_credentials_mfa_type_check" CHECK (
        ("auth_credentials"."mfa_enabled" = false  AND "auth_credentials"."mfa_type" IS NULL)
        OR
        ("auth_credentials"."mfa_enabled" = true  AND "auth_credentials"."mfa_type" IS NOT NULL)
      ),
	CONSTRAINT "auth_credentials_mfa_secret_check" CHECK (
        (  "auth_credentials"."mfa_enabled" = false)
        OR
        ( "auth_credentials"."mfa_secret_encrypted" IS NOT NULL)
      )
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"device_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"device_type" "device_type" DEFAULT 'WEB' NOT NULL,
	"platform" text,
	"os_version" text,
	"device_name" text,
	"app_version" text,
	"push_token" text,
	"fingerprint" text NOT NULL,
	"refresh_token_hash" text,
	"token_version" integer DEFAULT 0 NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"revoke_reason" text,
	"status" "device_status" DEFAULT 'ACTIVE' NOT NULL,
	"last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_refresh_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"login_history_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"device_id" uuid,
	"login_identifier" text,
	"ip_address" text,
	"user_agent" text,
	"login_method" "login_method" NOT NULL,
	"success" boolean NOT NULL,
	"failure_reason" "login_failure_reason",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_resource_permissions" (
	"organization_member_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid NOT NULL,
	"allow" boolean DEFAULT true NOT NULL,
	"assigned_by_user_id" uuid,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "member_resource_permissions_organization_member_id_permission_id_resource_id_pk" PRIMARY KEY("organization_member_id","permission_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "member_roles" (
	"organization_member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by_user_id" uuid,
	"expires_at" timestamp with time zone,
	CONSTRAINT "member_roles_organization_member_id_role_id_pk" PRIMARY KEY("organization_member_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"password_reset_token_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"status" "password_reset_token_status" DEFAULT 'PENDING' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"permission_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"security_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"device_id" uuid,
	"event_type" "security_event_type" NOT NULL,
	"ip_address" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_impersonations" (
	"user_impersonation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "impersonation_status" DEFAULT 'ACTIVE' NOT NULL,
	"ip_address" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"status" "user_status" DEFAULT 'PENDING' NOT NULL,
	"last_login_at" timestamp with time zone,
	"platform_role" "platform_role" DEFAULT 'USER' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"status_reason" text,
	"status_changed_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"api_key_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"prefix" text NOT NULL,
	"secret_hash" text NOT NULL,
	"type" "api_key_type" DEFAULT 'PERSONAL' NOT NULL,
	"status" "api_key_status" DEFAULT 'ACTIVE' NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"last_used_ip" text,
	"expires_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"created_by" uuid,
	"revoked_by" uuid,
	"revoke_reason" text,
	"revoked_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkeys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"credential_id" text NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" text,
	"device_type" text,
	"backed_up" boolean DEFAULT false NOT NULL,
	"name" text,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"city_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cities_city_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"state_id" integer NOT NULL,
	"city_name" text NOT NULL,
	"slug" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"timezone" text,
	"population" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "languages" (
	"language_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"language_code" text,
	"flag_emoji" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"state_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "states_state_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"state_name" text NOT NULL,
	"state_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_tags" (
	"component_tag_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "component_versions" (
	"component_version_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_id" uuid NOT NULL,
	"version" text NOT NULL,
	"changelog" text,
	"is_breaking" boolean DEFAULT false NOT NULL,
	"storage_key" text NOT NULL,
	"content_hash" text NOT NULL,
	"published_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "components" (
	"component_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"framework" "component_framework" DEFAULT 'UNIVERSAL' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_deprecated" boolean DEFAULT false NOT NULL,
	"deprecated_at" timestamp with time zone,
	"deprecation_note" text,
	"latest_version_id" uuid,
	"latest_version" text,
	"download_count" integer DEFAULT 0 NOT NULL,
	"repo_usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "repo_components" (
	"repo_component_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"used_version" text NOT NULL,
	"latest_version" text NOT NULL,
	"is_out_of_sync" boolean DEFAULT false NOT NULL,
	"file_path" text NOT NULL,
	"detected_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_webhook_events" (
	"github_webhook_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_connection_id" uuid,
	"delivery_id" text NOT NULL,
	"event" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"repository_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"provider_connection_id" uuid NOT NULL,
	"provider_repository_id" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"slug" text NOT NULL,
	"role" "repository_role" NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"visibility" "repository_visibility" DEFAULT 'PRIVATE' NOT NULL,
	"status" "repository_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_fork" boolean DEFAULT false NOT NULL,
	"clone_url" text,
	"ssh_url" text,
	"html_url" text,
	"last_synced_at" timestamp with time zone,
	"last_scanned_at" timestamp with time zone,
	"sync_score" integer DEFAULT 100 NOT NULL,
	"health_score" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invites" (
	"organization_invite_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"invited_by_user_id" uuid NOT NULL,
	"accepted_by_user_id" uuid,
	"role_id" uuid,
	"token_hash" text NOT NULL,
	"message" text,
	"status" "organizationInvite_status" DEFAULT 'PENDING' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"resent_count" integer DEFAULT 0 NOT NULL,
	"last_sent_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_member_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invited_by_user_id" uuid,
	"status" "organizationMember_status" DEFAULT 'INVITED' NOT NULL,
	"joined_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"removed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organization_settings_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_settings_object_check" CHECK (jsonb_typeof("organization_settings"."settings") = 'object')
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"organization_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"description" text,
	"avatar_url" text,
	"website" text,
	"email" text,
	"status" "organization_status" DEFAULT 'ACTIVE' NOT NULL,
	"plan" "organization_plan" DEFAULT 'FREE' NOT NULL,
	"is_personal" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environment_secrets" (
	"environment_secret_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"environment_id" uuid NOT NULL,
	"key" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rotated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "environment_variables" (
	"environment_variable_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"environment_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"type" "environment_variables_type" DEFAULT 'STRING' NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_readonly" boolean DEFAULT false NOT NULL,
	"status" "environment_variables_status" DEFAULT 'ACTIVE' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_environments" (
	"project_environment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "project_environment_type" DEFAULT 'CUSTOM' NOT NULL,
	"description" text,
	"color" text,
	"status" "project_environment_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"archived_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"project_id" uuid NOT NULL,
	"organization_member_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by_user_id" uuid,
	"expires_at" timestamp with time zone,
	CONSTRAINT "project_members_project_id_organization_member_id_pk" PRIMARY KEY("project_id","organization_member_id")
);
--> statement-breakpoint
CREATE TABLE "project_settings" (
	"project_settings_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_settings_json_object_check" CHECK (jsonb_typeof("project_settings"."settings") = 'object')
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"project_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"description" text,
	"icon_url" text,
	"color" text,
	"visibility" "project_visibility" DEFAULT 'PRIVATE' NOT NULL,
	"status" "project_status" DEFAULT 'ACTIVE' NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"archived_at" timestamp with time zone,
	"is_template" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_connections" (
	"provider_connection_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"account_id" text NOT NULL,
	"account_name" text NOT NULL,
	"installation_id" text,
	"status" "provider_connection_status" DEFAULT 'CONNECTED' NOT NULL,
	"access_token_encrypted" text,
	"refresh_token_encrypted" text,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_events" (
	"sync_event_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_proposal_id" uuid NOT NULL,
	"event" "sync_event_type" NOT NULL,
	"actor_id" uuid,
	"actor_type" "sync_actor_type" DEFAULT 'SYSTEM' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_proposals" (
	"sync_proposal_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"repository_id" uuid NOT NULL,
	"component_id" uuid NOT NULL,
	"from_component_version_id" uuid NOT NULL,
	"to_component_version_id" uuid NOT NULL,
	"proposal_type" "sync_proposal_type" DEFAULT 'UPDATE' NOT NULL,
	"status" "sync_status" DEFAULT 'PENDING' NOT NULL,
	"is_breaking" boolean DEFAULT false NOT NULL,
	"provider_pull_request_id" text,
	"provider_pull_request_number" integer,
	"provider_pull_request_url" text,
	"branch_name" text,
	"created_by_user_id" uuid,
	"approved_by_user_id" uuid,
	"conflict_metadata" jsonb,
	"failure_reason" text,
	"approved_at" timestamp with time zone,
	"merged_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_access" (
	"workspace_id" uuid NOT NULL,
	"organization_member_id" uuid NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_access_workspace_id_organization_member_id_pk" PRIMARY KEY("workspace_id","organization_member_id")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"workspace_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"description" text,
	"icon_url" text,
	"color" text,
	"status" "workspace_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth_providers" ADD CONSTRAINT "user_auth_providers_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_device_id_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("device_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_resource_permissions" ADD CONSTRAINT "member_resource_permissions_organization_member_id_organization_members_organization_member_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("organization_member_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member_resource_permissions" ADD CONSTRAINT "member_resource_permissions_permission_id_permissions_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("permission_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_organization_member_id_organization_members_organization_member_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("organization_member_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("permission_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_device_id_devices_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."devices"("device_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_impersonations" ADD CONSTRAINT "user_impersonations_admin_user_id_users_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_impersonations" ADD CONSTRAINT "user_impersonations_target_user_id_users_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("state_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "component_tags" ADD CONSTRAINT "component_tags_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_versions" ADD CONSTRAINT "component_versions_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_versions" ADD CONSTRAINT "component_versions_published_by_user_id_users_user_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_components" ADD CONSTRAINT "repo_components_repo_id_repositories_repository_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repositories"("repository_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_components" ADD CONSTRAINT "repo_components_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_webhook_events" ADD CONSTRAINT "github_webhook_events_provider_connection_id_provider_connections_provider_connection_id_fk" FOREIGN KEY ("provider_connection_id") REFERENCES "public"."provider_connections"("provider_connection_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_provider_connection_id_provider_connections_provider_connection_id_fk" FOREIGN KEY ("provider_connection_id") REFERENCES "public"."provider_connections"("provider_connection_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_invited_by_user_id_users_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_accepted_by_user_id_users_user_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_user_id_users_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_user_id_users_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("user_id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "environment_secrets" ADD CONSTRAINT "environment_secrets_environment_id_project_environments_project_environment_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."project_environments"("project_environment_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "environment_variables" ADD CONSTRAINT "environment_variables_environment_id_project_environments_project_environment_id_fk" FOREIGN KEY ("environment_id") REFERENCES "public"."project_environments"("project_environment_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_environments" ADD CONSTRAINT "project_environments_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_organization_member_id_organization_members_organization_member_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("organization_member_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("workspace_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "provider_connections" ADD CONSTRAINT "provider_connections_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_sync_proposal_id_sync_proposals_sync_proposal_id_fk" FOREIGN KEY ("sync_proposal_id") REFERENCES "public"."sync_proposals"("sync_proposal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_actor_id_users_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_repository_id_repositories_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("repository_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_from_component_version_id_component_versions_component_version_id_fk" FOREIGN KEY ("from_component_version_id") REFERENCES "public"."component_versions"("component_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_to_component_version_id_component_versions_component_version_id_fk" FOREIGN KEY ("to_component_version_id") REFERENCES "public"."component_versions"("component_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_created_by_user_id_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_approved_by_user_id_users_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_access" ADD CONSTRAINT "workspace_access_workspace_id_workspaces_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("workspace_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspace_access" ADD CONSTRAINT "workspace_access_organization_member_id_organization_members_organization_member_id_fk" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("organization_member_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "audit_logs_org_created_idx" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE UNIQUE INDEX "user_auth_provider_unique" ON "user_auth_providers" USING btree ("provider","provider_id");--> statement-breakpoint
CREATE INDEX "user_auth_user_idx" ON "user_auth_providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_auth_provider_idx" ON "user_auth_providers" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_credentials_user_unique" ON "auth_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_credentials_locked_until_idx" ON "auth_credentials" USING btree ("locked_until");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_push_token_unique" ON "devices" USING btree ("push_token");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_refresh_token_unique" ON "devices" USING btree ("refresh_token_hash");--> statement-breakpoint
CREATE INDEX "devices_user_idx" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "devices_user_fingerprint_unique" ON "devices" USING btree ("user_id","fingerprint");--> statement-breakpoint
CREATE INDEX "devices_status_idx" ON "devices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "devices_last_active_idx" ON "devices" USING btree ("last_active_at");--> statement-breakpoint
CREATE INDEX "login_history_user_idx" ON "login_history" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "login_history_device_idx" ON "login_history" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "login_history_identifier_idx" ON "login_history" USING btree ("login_identifier","created_at");--> statement-breakpoint
CREATE INDEX "login_history_ip_idx" ON "login_history" USING btree ("ip_address","created_at");--> statement-breakpoint
CREATE INDEX "login_history_created_at_idx" ON "login_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mrp_member_idx" ON "member_resource_permissions" USING btree ("organization_member_id");--> statement-breakpoint
CREATE INDEX "mrp_resource_idx" ON "member_resource_permissions" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "mrp_permission_idx" ON "member_resource_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "member_roles_member_idx" ON "member_roles" USING btree ("organization_member_id");--> statement-breakpoint
CREATE INDEX "member_roles_role_idx" ON "member_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_idx" ON "password_reset_tokens" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expiry_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_status_idx" ON "password_reset_tokens" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "permissions_unique" ON "permissions" USING btree (lower("resource"),lower("action"));--> statement-breakpoint
CREATE INDEX "permissions_resource_idx" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permissions_system_idx" ON "permissions" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_system_slug_uidx" ON "roles" USING btree (lower("slug")) WHERE "roles"."organization_id" IS NULL;--> statement-breakpoint
CREATE INDEX "roles_org_idx" ON "roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "roles_system_idx" ON "roles" USING btree ("is_system");--> statement-breakpoint
CREATE INDEX "security_events_user_idx" ON "security_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "security_events_device_idx" ON "security_events" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "security_events_type_idx" ON "security_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "security_events_created_at_idx" ON "security_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_impersonations_admin_idx" ON "user_impersonations" USING btree ("admin_user_id","started_at");--> statement-breakpoint
CREATE INDEX "user_impersonations_target_idx" ON "user_impersonations" USING btree ("target_user_id","started_at");--> statement-breakpoint
CREATE INDEX "user_impersonations_active_idx" ON "user_impersonations" USING btree ("status","started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_prefix_uidx" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "api_keys_user_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_org_idx" ON "api_keys" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "api_keys_status_idx" ON "api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "api_keys_expires_idx" ON "api_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "passkeys_credential_uidx" ON "passkeys" USING btree ("credential_id");--> statement-breakpoint
CREATE INDEX "passkeys_user_idx" ON "passkeys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cities_slug_unique" ON "cities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "cities_name_state_unique" ON "cities" USING btree (lower("city_name"),"state_id");--> statement-breakpoint
CREATE INDEX "cities_state_idx" ON "cities" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "cities_name_idx" ON "cities" USING btree ("city_name");--> statement-breakpoint
CREATE INDEX "cities_location_idx" ON "cities" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE UNIQUE INDEX "languages_name_unique" ON "languages" USING btree (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "languages_code_unique" ON "languages" USING btree (lower("language_code"));--> statement-breakpoint
CREATE INDEX "languages_code_idx" ON "languages" USING btree ("language_code");--> statement-breakpoint
CREATE INDEX "languages_active_idx" ON "languages" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "states_name_unique" ON "states" USING btree (lower("state_name"));--> statement-breakpoint
CREATE UNIQUE INDEX "states_code_unique" ON "states" USING btree (lower("state_code"));--> statement-breakpoint
CREATE INDEX "states_name_idx" ON "states" USING btree ("state_name");--> statement-breakpoint
CREATE UNIQUE INDEX "component_tags_unique" ON "component_tags" USING btree ("component_id","tag");--> statement-breakpoint
CREATE INDEX "component_tags_tag_idx" ON "component_tags" USING btree ("tag");--> statement-breakpoint
CREATE UNIQUE INDEX "component_versions_component_version_unique" ON "component_versions" USING btree ("component_id","version");--> statement-breakpoint
CREATE INDEX "component_versions_component_idx" ON "component_versions" USING btree ("component_id");--> statement-breakpoint
CREATE UNIQUE INDEX "components_org_slug_unique" ON "components" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "components_org_idx" ON "components" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "components_deprecated_idx" ON "components" USING btree ("is_deprecated");--> statement-breakpoint
CREATE UNIQUE INDEX "repo_components_repo_component_unique" ON "repo_components" USING btree ("repo_id","component_id");--> statement-breakpoint
CREATE INDEX "repo_components_out_of_sync_idx" ON "repo_components" USING btree ("is_out_of_sync");--> statement-breakpoint
CREATE INDEX "repo_components_repo_idx" ON "repo_components" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "repo_components_component_idx" ON "repo_components" USING btree ("component_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_webhook_events_delivery_unique" ON "github_webhook_events" USING btree ("delivery_id");--> statement-breakpoint
CREATE INDEX "github_webhook_events_processed_idx" ON "github_webhook_events" USING btree ("processed");--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_provider_unique" ON "repositories" USING btree ("provider_connection_id","provider_repository_id");--> statement-breakpoint
CREATE UNIQUE INDEX "repositories_project_slug_unique" ON "repositories" USING btree ("project_id",lower("slug"));--> statement-breakpoint
CREATE INDEX "repositories_project_idx" ON "repositories" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "repositories_provider_idx" ON "repositories" USING btree ("provider_connection_id");--> statement-breakpoint
CREATE INDEX "repositories_status_idx" ON "repositories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "repositories_role_idx" ON "repositories" USING btree ("role");--> statement-breakpoint
CREATE INDEX "repositories_sync_score_idx" ON "repositories" USING btree ("sync_score");--> statement-breakpoint
CREATE INDEX "organization_invites_org_idx" ON "organization_invites" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_invites_email_idx" ON "organization_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "organization_invites_status_idx" ON "organization_invites" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_invites_token_unique" ON "organization_invites" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_member_unique" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "organization_member_org_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_member_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_member_status_idx" ON "organization_members" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_settings_org_unique" ON "organization_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_unique" ON "organizations" USING btree (lower("slug"));--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_one_personal_per_owner_uidx" ON "organizations" USING btree ("owner_user_id") WHERE "organizations"."is_personal" = true;--> statement-breakpoint
CREATE INDEX "organizations_owner_idx" ON "organizations" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "organizations_status_idx" ON "organizations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "organizations_plan_idx" ON "organizations" USING btree ("plan");--> statement-breakpoint
CREATE UNIQUE INDEX "environment_secret_unique" ON "environment_secrets" USING btree ("environment_id",lower("key"));--> statement-breakpoint
CREATE INDEX "environment_secret_environment_idx" ON "environment_secrets" USING btree ("environment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "environment_variable_unique" ON "environment_variables" USING btree ("environment_id",lower("key"));--> statement-breakpoint
CREATE INDEX "environment_variable_environment_idx" ON "environment_variables" USING btree ("environment_id");--> statement-breakpoint
CREATE INDEX "environment_variable_status_idx" ON "environment_variables" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_environment_slug_unique" ON "project_environments" USING btree ("project_id",lower("slug"));--> statement-breakpoint
CREATE INDEX "project_environment_project_idx" ON "project_environments" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_environment_status_idx" ON "project_environments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "project_environment_type_idx" ON "project_environments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "project_members_project_idx" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_workspace_member_idx" ON "project_members" USING btree ("organization_member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_settings_project_unique" ON "project_settings" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_workspace_slug_unique" ON "projects" USING btree ("workspace_id",lower("slug"));--> statement-breakpoint
CREATE INDEX "projects_workspace_idx" ON "projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_visibility_idx" ON "projects" USING btree ("visibility");--> statement-breakpoint
CREATE UNIQUE INDEX "provider_connection_unique" ON "provider_connections" USING btree ("organization_id","provider","account_id");--> statement-breakpoint
CREATE INDEX "provider_connection_org_idx" ON "provider_connections" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sync_events_proposal_idx" ON "sync_events" USING btree ("sync_proposal_id");--> statement-breakpoint
CREATE INDEX "sync_events_event_idx" ON "sync_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "sync_events_created_at_idx" ON "sync_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sync_proposals_org_idx" ON "sync_proposals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_repository_idx" ON "sync_proposals" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_component_idx" ON "sync_proposals" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_status_idx" ON "sync_proposals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_proposals_open_unique" ON "sync_proposals" USING btree ("repository_id","component_id","status");--> statement-breakpoint
CREATE INDEX "workspace_access_workspace_idx" ON "workspace_access" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_access_member_idx" ON "workspace_access" USING btree ("organization_member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_slug_unique" ON "workspaces" USING btree ("organization_id",lower("slug"));--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_one_default_per_org_uidx" ON "workspaces" USING btree ("organization_id") WHERE "workspaces"."is_default" = true;--> statement-breakpoint
CREATE INDEX "workspace_org_idx" ON "workspaces" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "workspace_status_idx" ON "workspaces" USING btree ("status");