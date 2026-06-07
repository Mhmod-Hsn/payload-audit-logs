import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterReadHook
} from 'payload';

export const createAfterChangeHook = (): CollectionAfterChangeHook => 
  async ({ collection, doc, operation, previousDoc, req }) => {
    const { payload, user } = req

    try {
      await payload.create({
        collection: 'audit-logs',
        data: {
          documentId: String(doc.id),
          entity: collection.slug,
          newData: doc,
          operation,
          originalData: operation === 'update' ? previousDoc : null,
          user: user?.id || null,
        },
        req,
      })
    } catch (err) {
      payload.logger.error(`Error creating audit log for ${operation} on ${collection.slug}: ${err}`)
    }

    return doc
  }

export const createAfterDeleteHook = (): CollectionAfterDeleteHook => 
  async ({ collection, doc, req }) => {
    const { payload, user } = req

    try {
      await payload.create({
        collection: 'audit-logs',
        data: {
          documentId: String(doc.id),
          entity: collection.slug,
          operation: 'delete',
          originalData: doc,
          user: user?.id || null,
        },
        req,
      })
    } catch (err) {
      payload.logger.error(`Error creating audit log for delete on ${collection.slug}: ${err}`)
    }

    return doc
  }

export const createAfterReadHook = (): CollectionAfterReadHook => 
  async ({ collection, doc, req }) => {
    // Only log read if it's not the audit-logs collection itself and we have a doc ID
    if (collection.slug === 'audit-logs' || !doc?.id) {return doc}

    const { payload, user } = req

    try {
      await payload.create({
        collection: 'audit-logs',
        data: {
          documentId: String(doc.id),
          entity: collection.slug,
          newData: doc,
          operation: 'read',
          user: user?.id || null,
        },
        req,
      })
    } catch (err) {
      payload.logger.error(`Error creating audit log for read on ${collection.slug}: ${err}`)
    }

    return doc
  }
