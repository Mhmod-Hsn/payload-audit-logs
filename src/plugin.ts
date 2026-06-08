import type { Config, Plugin } from 'payload';

import type { AuditLogConfig } from './types';

import { getAuditLogsCollection } from './collections/AuditLogs';
import {
  createAfterChangeHook,
  createAfterDeleteHook,
  createAfterReadHook
} from './hooks/auditLogHook';

export const auditLogPlugin =
  (pluginOptions: AuditLogConfig): Plugin =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }


    // Add AuditLogs collection
    if (!config.collections) {
      config.collections = []
    }
    
    // Check if audit-logs already exists to avoid duplicates
    const auditLogsExists = config.collections.some(c => c.slug === 'audit-logs')
    if (!auditLogsExists) {
      config.collections.push(getAuditLogsCollection(pluginOptions))
    }

    // Apply hooks to configured collections
    if (pluginOptions.collections) {
      config.collections = config.collections.map((collection) => {
        const option = pluginOptions.collections[collection.slug]
        
        if (option) {
          const { operations } = option
          
          if (!collection.hooks) {
            collection.hooks = {}
          }

          // Handle Create and Update operations
          if (operations.includes('create') || operations.includes('update')) {
            if (!collection.hooks.afterChange) {
              collection.hooks.afterChange = []
            }
            collection.hooks.afterChange.push(createAfterChangeHook())
          }

          // Handle Delete operation
          if (operations.includes('delete')) {
            if (!collection.hooks.afterDelete) {
              collection.hooks.afterDelete = []
            }
            collection.hooks.afterDelete.push(createAfterDeleteHook())
          }

          // Handle Read operation
          if (operations.includes('read')) {
            if (!collection.hooks.afterRead) {
              collection.hooks.afterRead = []
            }
            collection.hooks.afterRead.push(createAfterReadHook())
          }
        }

        return collection
      })
    }

    return config
  }
