# Payload Audit Logs

A [Payload CMS](https://payloadcms.com) plugin to automatically track and log CRUD operations (Create, Read, Update, Delete) on specified collections.

## Features

- **Automatic Logging**: Automatically creates audit logs for `create`, `read`, `update`, and `delete` operations.
- **Configurable**: Choose which collections and which operations to track.
- **Historical Data**: Stores both the `originalData` (before change) and `newData` (after change) for full auditability.
- **User Association**: Automatically links logs to the user who performed the operation.
- **Easy Integration**: Simple setup in your Payload configuration.

## Installation

```bash
pnpm add payload-audit-logs
# or
npm install payload-audit-logs
# or
yarn add payload-audit-logs
```

## Usage

Add the plugin to your Payload configuration:

```ts
import { buildConfig } from 'payload'
import { auditLogPlugin } from 'payload-audit-logs'

export default buildConfig({
  plugins: [
    auditLogPlugin({
      collections: {
        posts: {
          operations: ['create', 'update', 'delete'],
        },
        users: {
          operations: ['create', 'update', 'delete'],
        },
        media: {
          operations: ['create', 'update', 'delete'],
        },
      },
      userCollection: 'users', // Optional, defaults to 'users'
    }),
  ],
  // ... rest of your config
})
```

## Configuration

The plugin accepts the following options:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `collections` | `Record<string, { operations: string[] }>` | `{}` | A map of collection slugs to track and the operations to log for each. |
| `disabled` | `boolean` | `false` | If `true`, the plugin will be disabled. |
| `userCollection` | `string` | `'users'` | The slug of the collection used for users. |
| `auditLogsAccess` | `CollectionConfig['access']` | `{ ... }` | Access control functions for the generated Audit Logs collection. |
| `hideAuditLogs` | `boolean \| ((args: { user: PayloadRequest['user'] \| null }) => boolean)` | `false` | Hide the Audit Logs collection from the sidebar navigation. |

### Operations

You can specify which operations to log for each collection:
- `create`: Logs when a new document is created.
- `read`: Logs when a document is retrieved.
- `update`: Logs when an existing document is modified.
- `delete`: Logs when a document is removed.

> **CAUTION**: Enabling the `read` operation can significantly increase database storage consumption and create redundant logs, especially for high-traffic collections. Use it sparingly and only when strictly necessary for auditing sensitive information.

## Code Sample

```ts
import { buildConfig } from 'payload'
import { auditLogPlugin } from 'payload-audit-logs'

export default buildConfig({
  plugins: [
    auditLogPlugin({
      // Track specific collections
      collections: {
        posts: {
          operations: ['create', 'update', 'delete'],
        },
        // Sensitive data might require 'read' logging
        settings: {
          operations: ['read', 'update'],
        },
      },
      // Configure user collection if it's not 'users'
      userCollection: 'admins',
      // Useful for environment-specific disabling
      disabled: process.env.NODE_ENV === 'test',
    }),
  ],
})
```

## Audit Logs Collection

When the plugin is enabled, it automatically adds an `Audit Logs` collection to your Payload admin panel.

### Fields

- **Entity**: The slug of the collection where the operation occurred.
- **Document ID**: The ID of the affected document.
- **Operation**: The type of operation performed (`create`, `read`, `update`, or `delete`).
- **User**: A relationship to the user who performed the operation.
- **Original Data**: (JSON) The data before the change occurred (available for `update` and `delete`).
- **New Data**: (JSON) The data after the change occurred (available for `create`, `read`, and `update`).
- **Created At**: Timestamp of when the log entry was created.

### Access Control

By default:
- **Create/Update/Delete**: Restricted (only the plugin can create logs).
- **Read**: Any authenticated user can view audit logs.

You can fully customize these rules by providing the `auditLogsAccess` property in your plugin configuration.

## Development

If you want to contribute or modify the plugin:

1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Start the dev project: `pnpm dev`.
4. Run tests: `pnpm test`.

## License

MIT
