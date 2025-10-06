# Cozi API Client

[![npm version](https://badge.fury.io/js/%40brandcast_app%2Fcozi-api-client.svg)](https://badge.fury.io/js/%40brandcast_app%2Fcozi-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Unofficial TypeScript/JavaScript client for the Cozi Family Organizer API.

## ⚠️ Important Disclaimer

**This is an UNOFFICIAL client library.** Cozi does not provide a public API, and this library is based on reverse engineering from the [py-cozi](https://github.com/Wetzel402/py-cozi) Python library.

**Use at your own risk:**
- The API may change without notice
- Your account could be suspended for using unofficial clients
- This library is provided AS-IS with no warranties
- Not affiliated with or endorsed by Cozi

## Features

- 🔐 Username/password authentication
- 📝 Full CRUD operations for lists (shopping & todo)
- ✅ Item management (add, edit, mark, remove)
- 📦 TypeScript support with full type definitions
- 🛡️ Error handling and type safety
- 🐛 Optional debug logging

## Installation

```bash
npm install @brandcast_app/cozi-api-client
```

or

```bash
yarn add @brandcast_app/cozi-api-client
```

## Quick Start

```typescript
import { CoziApiClient } from '@brandcast_app/cozi-api-client';

// Create a client instance
const client = new CoziApiClient({
  debug: true, // Optional: enable debug logging
  timeout: 30000, // Optional: request timeout in ms (default: 30000)
  userAgent: 'my-app', // Optional: custom user agent
});

// Authenticate
const auth = await client.authenticate('your@email.com', 'your-password');
console.log('Authenticated with account:', auth.accountId);

// Get all lists
const lists = await client.getLists();
console.log('Found lists:', lists.length);

// Work with lists
for (const list of lists) {
  console.log(`${list.title} (${list.listType}): ${list.items.length} items`);

  for (const item of list.items) {
    console.log(`  - [${item.status}] ${item.text}`);
  }
}
```

## API Reference

### Authentication

#### `authenticate(username: string, password: string): Promise<CoziAuthResponse>`

Authenticate with Cozi using your email and password.

```typescript
const auth = await client.authenticate('your@email.com', 'your-password');
// Returns: { accountId, accountPersonId, accessToken, expiresIn }
```

#### `setSessionToken(token: string, accountId?: string): void`

Restore a previous session using a stored access token.

```typescript
client.setSessionToken(storedToken, storedAccountId);
```

### Lists

#### `getLists(): Promise<CoziList[]>`

Get all lists for the authenticated user.

```typescript
const lists = await client.getLists();
```

#### `getList(listId: string): Promise<CoziList>`

Get a specific list by ID.

```typescript
const list = await client.getList('list-id');
```

#### `addList(request: AddListRequest): Promise<string>`

Create a new list.

```typescript
const listId = await client.addList({
  title: 'Grocery Shopping',
  type: 'shopping' // 'shopping' or 'todo'
});
```

#### `removeList(listId: string): Promise<void>`

Delete a list.

```typescript
await client.removeList('list-id');
```

#### `reorderList(request: ReorderListRequest): Promise<void>`

Change the order of a list.

```typescript
await client.reorderList({
  listId: 'list-id',
  newOrder: 2
});
```

### Items

#### `addItem(request: AddItemRequest): Promise<void>`

Add an item to a list.

```typescript
await client.addItem({
  listId: 'shopping-list-id',
  text: 'Milk'
});
```

#### `editItem(request: EditItemRequest): Promise<void>`

Edit an existing item.

```typescript
await client.editItem({
  listId: 'shopping-list-id',
  itemId: 'item-id',
  text: 'Whole Milk'
});
```

#### `markItem(request: MarkItemRequest): Promise<void>`

Mark an item as complete or incomplete.

```typescript
// Mark as complete
await client.markItem({
  listId: 'shopping-list-id',
  itemId: 'item-id',
  completed: true
});

// Mark as incomplete
await client.markItem({
  listId: 'shopping-list-id',
  itemId: 'item-id',
  completed: false
});
```

#### `removeItem(request: RemoveItemRequest): Promise<void>`

Remove an item from a list.

```typescript
await client.removeItem({
  listId: 'shopping-list-id',
  itemId: 'item-id'
});
```

## Type Definitions

### CoziList

```typescript
interface CoziList {
  listId: string;
  title: string;
  listType: 'shopping' | 'todo';
  items: CoziItem[];
  version: number;
  notes?: string | null;
  owner?: string | null;
}
```

### CoziItem

```typescript
interface CoziItem {
  itemId: string;
  text: string;
  status: 'incomplete' | 'complete';
  itemType?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  owner?: string | null;
  version: number;
}
```

### CoziAuthResponse

```typescript
interface CoziAuthResponse {
  accountId: string;
  accountPersonId: string;
  accessToken: string;
  expiresIn: number; // seconds
}
```

## Complete Example

```typescript
import { CoziApiClient } from '@brandcast_app/cozi-api-client';

async function main() {
  // Create client with debug logging
  const client = new CoziApiClient({ debug: true });

  try {
    // Authenticate
    const auth = await client.authenticate('your@email.com', 'your-password');
    console.log('✓ Authenticated successfully');

    // Get all lists
    const lists = await client.getLists();
    console.log(`✓ Found ${lists.length} lists`);

    // Find shopping list
    const shoppingList = lists.find(l => l.listType === 'shopping');
    if (!shoppingList) {
      throw new Error('No shopping list found');
    }

    // Add an item
    await client.addItem({
      listId: shoppingList.listId,
      text: 'Organic Milk'
    });
    console.log('✓ Added item to shopping list');

    // Get updated list
    const updatedList = await client.getList(shoppingList.listId);
    const newItem = updatedList.items.find(i => i.text === 'Organic Milk');

    if (newItem) {
      // Mark it as complete
      await client.markItem({
        listId: shoppingList.listId,
        itemId: newItem.itemId,
        completed: true
      });
      console.log('✓ Marked item as complete');

      // Remove it
      await client.removeItem({
        listId: shoppingList.listId,
        itemId: newItem.itemId
      });
      console.log('✓ Removed item from list');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Error Handling

The client throws errors that conform to the `CoziApiError` interface:

```typescript
interface CoziApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

Example error handling:

```typescript
try {
  await client.addItem({
    listId: 'invalid-list-id',
    text: 'Test item'
  });
} catch (error) {
  const coziError = error as CoziApiError;
  console.error('Error code:', coziError.code);
  console.error('Error message:', coziError.message);
  console.error('Error details:', coziError.details);
}
```

## Session Management

Access tokens expire after a certain period (specified in `expiresIn` from the auth response). You can store the token and accountId to avoid re-authenticating:

```typescript
// Initial authentication
const auth = await client.authenticate('your@email.com', 'your-password');

// Store token securely
localStorage.setItem('cozi_token', auth.accessToken);
localStorage.setItem('cozi_account_id', auth.accountId);

// Later, restore session
const storedToken = localStorage.getItem('cozi_token');
const storedAccountId = localStorage.getItem('cozi_account_id');

if (storedToken && storedAccountId) {
  client.setSessionToken(storedToken, storedAccountId);
  // Now you can make API calls without re-authenticating
}
```

## Development

### Building

```bash
npm install
npm run build
```

### Testing

```bash
npm test
```

## Credits

This library is based on the excellent reverse engineering work done in the [py-cozi](https://github.com/Wetzel402/py-cozi) Python library.

## Legal

This is an unofficial library and is not affiliated with, endorsed by, or connected to Cozi. Use at your own risk. The developers of this library are not responsible for any issues that may arise from its use.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 🐛 [Report Issues](https://github.com/BrandCast-Signage/cozi-api-client/issues)
- 💬 [Discussions](https://github.com/BrandCast-Signage/cozi-api-client/discussions)

## Changelog

### 0.1.0 (Initial Release)

- ✨ Initial implementation
- 🔐 Username/password authentication
- 📝 List management (create, read, update, delete, reorder)
- ✅ Item management (add, edit, mark, remove)
- 📦 Full TypeScript support
- 🐛 Debug logging option
