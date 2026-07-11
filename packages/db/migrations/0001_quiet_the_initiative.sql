CREATE TYPE "public"."audit_action" AS ENUM('ORG_UPDATED', 'ORG_DELETED', 'MEMBER_INVITED', 'MEMBER_REMOVED', 'MEMBER_ROLE_UPDATED', 'REPO_CONNECTED', 'REPO_DISCONNECTED', 'COMPONENT_PUBLISHED', 'COMPONENT_DEPRECATED', 'COMPONENT_DELETED', 'SYNC_APPROVED', 'SYNC_REJECTED', 'SYNC_BULK_APPROVED', 'VULNERABILITY_DISMISSED', 'VULNERABILITY_PATCHED', 'TOKEN_CREATED', 'TOKEN_REVOKED', 'WEBHOOK_UPDATED');--> statement-breakpoint
CREATE TYPE "public"."audit_resource_type" AS ENUM('USER', 'ORGANIZATION', 'ORGANIZATION_MEMBER', 'INVITATION', 'PROJECT', 'WORKSPACE', 'PROVIDER_CONNECTION', 'REPOSITORY', 'COMPONENT', 'COMPONENT_VERSION', 'SYNC_PROPOSAL', 'API_KEY', 'WEBHOOK', 'SETTING', 'AUTH', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."component_framework" AS ENUM('REACT', 'VUE', 'SVELTE', 'ANGULAR', 'SOLID', 'UNIVERSAL');--> statement-breakpoint
CREATE TYPE "public"."repository_role" AS ENUM('SOURCE', 'CONSUMER');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."sync_event_type" AS ENUM('PROPOSED', 'PR_OPENED', 'PR_MERGED', 'PR_CLOSED', 'APPROVED', 'REJECTED', 'CONFLICT', 'ROLLBACK');--> statement-breakpoint
CREATE TYPE "public"."sync_proposal_type" AS ENUM('UPDATE', 'ROLLBACK', 'SECURITY', 'MANUAL');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('PENDING', 'GENERATING_PR', 'PR_OPENED', 'APPROVED', 'MERGED', 'REJECTED', 'CONFLICT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."vulnerability_status" AS ENUM('OPEN', 'PATCHED', 'DISMISSED', 'FALSE_POSITIVE');--> statement-breakpoint
CREATE TYPE "public"."sync_actor_type" AS ENUM('USER', 'SYSTEM', 'PROVIDER');--> statement-breakpoint
ALTER TYPE "public"."login_failure_reason" ADD VALUE 'EAMIL_NOT_VERIFIED';--> statement-breakpoint
ALTER TYPE "public"."repository_status" ADD VALUE 'SYNCING';--> statement-breakpoint
ALTER TYPE "public"."repository_status" ADD VALUE 'ERROR';--> statement-breakpoint
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
ALTER TABLE "auth_credentials" DROP CONSTRAINT "auth_credentials_mfa_type_consistency_check";--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD COLUMN "mfa_pending_secret_encrypted" text;--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD COLUMN "mfa_pending_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD COLUMN "mfa_recovery_codes_encrypted" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_tags" ADD CONSTRAINT "component_tags_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_versions" ADD CONSTRAINT "component_versions_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_versions" ADD CONSTRAINT "component_versions_published_by_user_id_users_user_id_fk" FOREIGN KEY ("published_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_components" ADD CONSTRAINT "repo_components_repo_id_repositories_repository_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repositories"("repository_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_components" ADD CONSTRAINT "repo_components_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_webhook_events" ADD CONSTRAINT "github_webhook_events_provider_connection_id_provider_connections_provider_connection_id_fk" FOREIGN KEY ("provider_connection_id") REFERENCES "public"."provider_connections"("provider_connection_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_provider_connection_id_provider_connections_provider_connection_id_fk" FOREIGN KEY ("provider_connection_id") REFERENCES "public"."provider_connections"("provider_connection_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_sync_proposal_id_sync_proposals_sync_proposal_id_fk" FOREIGN KEY ("sync_proposal_id") REFERENCES "public"."sync_proposals"("sync_proposal_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_actor_id_users_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_organization_id_organizations_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("organization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_repository_id_repositories_repository_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("repository_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_component_id_components_component_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("component_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_from_component_version_id_component_versions_component_version_id_fk" FOREIGN KEY ("from_component_version_id") REFERENCES "public"."component_versions"("component_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_to_component_version_id_component_versions_component_version_id_fk" FOREIGN KEY ("to_component_version_id") REFERENCES "public"."component_versions"("component_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_created_by_user_id_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_proposals" ADD CONSTRAINT "sync_proposals_approved_by_user_id_users_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_org_created_idx" ON "audit_logs" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
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
CREATE INDEX "sync_events_proposal_idx" ON "sync_events" USING btree ("sync_proposal_id");--> statement-breakpoint
CREATE INDEX "sync_events_event_idx" ON "sync_events" USING btree ("event");--> statement-breakpoint
CREATE INDEX "sync_events_created_at_idx" ON "sync_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sync_proposals_org_idx" ON "sync_proposals" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_repository_idx" ON "sync_proposals" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_component_idx" ON "sync_proposals" USING btree ("component_id");--> statement-breakpoint
CREATE INDEX "sync_proposals_status_idx" ON "sync_proposals" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "sync_proposals_open_unique" ON "sync_proposals" USING btree ("repository_id","component_id","status");--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_mfa_type_check" CHECK (
        ("auth_credentials"."mfa_enabled" = false  AND "auth_credentials"."mfa_type" IS NULL)
        OR
        ("auth_credentials"."mfa_enabled" = true  AND "auth_credentials"."mfa_type" IS NOT NULL)
      );--> statement-breakpoint
ALTER TABLE "auth_credentials" ADD CONSTRAINT "auth_credentials_mfa_secret_check" CHECK (
        (  "auth_credentials"."mfa_enabled" = false)
        OR
        ( "auth_credentials"."mfa_secret_encrypted" IS NOT NULL)
      );