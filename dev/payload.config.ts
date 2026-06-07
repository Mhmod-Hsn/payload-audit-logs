import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import path from 'path';
import { buildConfig } from 'payload';
import { auditLogPlugin } from 'payload-audit-logs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { testEmailAdapter } from './helpers/testEmailAdapter';
import { seed } from './seed';

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  const isTesting = process.env.NODE_ENV === 'test'
  if (isTesting) {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: {
        count: 3,
        dbName: 'payloadmemory',
      },
    })

    process.env.DATABASE_URL = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'users',
        auth: true, 
        fields: [],
      },
      {
        slug: 'posts',
        fields: [
          {
            name: 'title',
            type: 'text',
          },
          {
            name: "excerpt",
            type: "textarea",
          },
          {
            name: 'content',
            type: 'richText',
          }
        ],
      },
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: isTesting ? mongooseAdapter({
      url: process.env.DATABASE_URL || `mongodb://localhost:27017/payloadmemory`,
    }) : sqliteAdapter({
      client: {
        url: process.env.DATABASE_URL || `file:${path.resolve(dirname, 'payload.db')}`,
      },
    }),
 
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      auditLogPlugin({
        collections: {
          media: {
            operations: ['create', 'update', 'delete'],
          },
          posts: {
            operations: ['create', 'update', 'delete'],
          },
          users: {
            operations: ['create', 'update', 'delete'],
          },
        },
      }),
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
 