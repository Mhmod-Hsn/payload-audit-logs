import type { CollectionConfig } from 'payload';

export const getAuditLogsCollection = (userCollection: string = 'users'): CollectionConfig => ({
  slug: 'audit-logs',
  access: {
    create: () => false,
    delete: () => false,
    read: ({ req: { user } }) => !!user,
    update: () => false,
  },
  admin: {
    defaultColumns: ['entity', 'operation', 'user', 'createdAt'],
    group: 'Admin',
    useAsTitle: 'entity',
  },
  fields: [
    {
      name: 'entity',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'documentId',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'operation',
      type: 'select',
      index: true,
      options: [
				{ label: 'Create', value: 'create' },
        { label: 'Read', value: 'read' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
      ],
			required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: userCollection as any,
      required: false,
    },
    {
      name: 'diffViewer',
      type: 'ui',
      admin: {
        components: {
          Field: 'payload-audit-logs/client#DiffViewer',
        },
      },
    },
    {
      name: 'originalData',
      type: 'json',
      admin: {
        condition: (data) => !!data?.originalData,
      },
    },
    {
      name: 'newData',
      type: 'json',
      admin: {
        condition: (data) => !!data?.newData,
      },
    },
  ],
  timestamps: true,
})
