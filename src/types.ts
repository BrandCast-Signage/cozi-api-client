/**
 * Cozi API Client Types
 *
 * Based on reverse engineering from py-cozi library:
 * https://github.com/Wetzel402/py-cozi
 *
 * NOTE: This is an UNOFFICIAL client. Cozi does not provide a public API.
 * Use at your own risk. The API may change without notice.
 */

/**
 * Credentials for authenticating with Cozi
 */
export interface CoziCredentials {
  username: string;
  password: string;
}

/**
 * Session information returned after successful authentication
 */
export interface CoziSession {
  accessToken: string;
  accountId: string;
  accountPersonId: string;
  expiresAt: Date;
}

/**
 * A Cozi list (shopping or todo)
 */
export interface CoziList {
  listId: string;
  title: string;
  listType: 'shopping' | 'todo';
  items: CoziItem[];
  version: number;
  notes?: string | null;
  owner?: string | null;
}

/**
 * An item within a Cozi list
 */
export interface CoziItem {
  itemId: string;
  text: string;
  status: 'incomplete' | 'complete';
  itemType?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  owner?: string | null;
  version: number;
}

/**
 * Response from the lists endpoint
 */
export interface CoziListsResponse {
  lists: CoziList[];
  timestamp: Date;
}

/**
 * Authentication response from Cozi API
 */
export interface CoziAuthResponse {
  accountId: string;
  accountPersonId: string;
  accessToken: string;
  expiresIn: number; // seconds
}

/**
 * Error response from Cozi API
 */
export interface CoziApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Request to add a new list
 */
export interface AddListRequest {
  title: string;
  type: 'shopping' | 'todo';
}

/**
 * Request to add a new item to a list
 */
export interface AddItemRequest {
  listId: string;
  text: string;
}

/**
 * Request to edit an existing item
 */
export interface EditItemRequest {
  listId: string;
  itemId: string;
  text: string;
}

/**
 * Request to mark an item as complete/incomplete
 */
export interface MarkItemRequest {
  listId: string;
  itemId: string;
  completed: boolean;
}

/**
 * Request to remove an item from a list
 */
export interface RemoveItemRequest {
  listId: string;
  itemId: string;
}

/**
 * Request to reorder a list
 */
export interface ReorderListRequest {
  listId: string;
  newOrder: number;
}
