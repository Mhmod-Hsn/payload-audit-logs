import type { CollectionConfig, CollectionSlug, PayloadRequest } from 'payload';

export type AuditLogOperation = 'create' | 'delete' | 'read' | 'update'

export interface AuditLogConfig {
  /**
   * Access control functions for the generated Audit Logs collection
   */
  auditLogsAccess?: CollectionConfig['access']
  /**
   * List of collections to track and which operations to log for each.
   */
  collections: Partial<Record<CollectionSlug, {
    operations: AuditLogOperation[]
  }>>
  /**
   * Whether the plugin is disabled.
   */
  disabled?: boolean
  /**
   * Hide the Audit Logs collection from the Admin panel sidebar/dashboard
   * Can be a boolean or a function based on the logged-in user
   * @default false
   */
  hideAuditLogs?: ((args: { user: null | PayloadRequest['user'] }) => boolean) | boolean
  /**
   * The slug of the collection used for users. Defaults to 'users'.
   */
  userCollection?: CollectionSlug
}
