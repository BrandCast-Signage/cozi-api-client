/**
 * Cozi API Client
 *
 * Unofficial TypeScript/JavaScript client for Cozi Family Organizer API
 * Based on reverse engineering from py-cozi library
 *
 * @see https://github.com/Wetzel402/py-cozi
 *
 * WARNING: This is an UNOFFICIAL client. Cozi does not provide a public API.
 * This implementation is based on reverse engineering and may break at any time.
 * Use at your own risk.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  CoziAuthResponse,
  CoziList,
  AddListRequest,
  AddItemRequest,
  EditItemRequest,
  MarkItemRequest,
  RemoveItemRequest,
  ReorderListRequest,
  CoziApiError,
} from './types';

export interface CoziApiClientConfig {
  /** Custom user agent string (optional) */
  userAgent?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

export class CoziApiClient {
  private client: AxiosInstance;
  private sessionToken: string | null = null;
  private accountId: string | null = null;
  private debug: boolean;

  // Cozi API base URL (from py-cozi)
  private static readonly BASE_URL = 'https://rest.cozi.com';
  private static readonly API_VERSION = 'api/ext/2207';

  constructor(config: CoziApiClientConfig = {}) {
    this.debug = config.debug ?? false;

    this.client = axios.create({
      baseURL: `${CoziApiClient.BASE_URL}/${CoziApiClient.API_VERSION}`,
      timeout: config.timeout ?? 30000,
      headers: {
        'User-Agent': config.userAgent ?? 'cozi-api-client',
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      if (this.sessionToken) {
        config.headers.Authorization = `Bearer ${this.sessionToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const coziError: CoziApiError = {
          code: error.response?.status?.toString() ?? 'UNKNOWN_ERROR',
          message: error.message,
          details: error.response?.data,
        };
        return Promise.reject(coziError);
      }
    );
  }

  /**
   * Authenticate with Cozi using username/password
   *
   * @param username - Cozi account username (email)
   * @param password - Cozi account password
   * @returns Authentication response with session token
   *
   * @example
   * ```typescript
   * const client = new CoziApiClient();
   * const auth = await client.authenticate('user@example.com', 'password');
   * console.log('Authenticated with account:', auth.accountId);
   * ```
   */
  async authenticate(username: string, password: string): Promise<CoziAuthResponse> {
    if (this.debug) {
      console.log('[CoziApiClient] Authenticating...');
    }

    try {
      const response = await this.client.post<CoziAuthResponse>('/auth/login', {
        username,
        password,
      });

      this.sessionToken = response.data.accessToken;
      this.accountId = response.data.accountId;

      if (this.debug) {
        console.log('[CoziApiClient] Authentication successful:', {
          accountId: this.accountId,
          expiresIn: response.data.expiresIn,
        });
      }

      return response.data;
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Authentication failed:', error);
      }
      throw error;
    }
  }

  /**
   * Set session token and accountId directly (for stored sessions)
   *
   * @param token - Access token from previous authentication
   * @param accountId - Account ID from previous authentication (optional)
   *
   * @example
   * ```typescript
   * const client = new CoziApiClient();
   * client.setSessionToken(storedToken, storedAccountId);
   * ```
   */
  setSessionToken(token: string, accountId?: string): void {
    this.sessionToken = token;
    if (accountId) {
      this.accountId = accountId;
    }

    if (this.debug) {
      console.log('[CoziApiClient] Session token set:', { accountId: this.accountId });
    }
  }

  /**
   * Get all lists for the authenticated user
   *
   * @returns Array of Cozi lists
   *
   * @example
   * ```typescript
   * const lists = await client.getLists();
   * console.log('Found lists:', lists.length);
   * lists.forEach(list => {
   *   console.log(`- ${list.title} (${list.listType}): ${list.items.length} items`);
   * });
   * ```
   */
  async getLists(): Promise<CoziList[]> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    if (this.debug) {
      console.log('[CoziApiClient] Fetching lists...');
    }

    try {
      const response = await this.client.get<CoziList[]>(`/api/ext/2004/${this.accountId}/list/`);

      if (this.debug) {
        console.log(`[CoziApiClient] Found ${response.data.length} lists`);
      }

      return response.data;
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to fetch lists:', error);
      }
      throw error;
    }
  }

  /**
   * Get a specific list by ID
   *
   * @param listId - The ID of the list to fetch
   * @returns The requested list
   *
   * @example
   * ```typescript
   * const list = await client.getList('shopping-list-id');
   * console.log(`${list.title}: ${list.items.length} items`);
   * ```
   */
  async getList(listId: string): Promise<CoziList> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    if (this.debug) {
      console.log(`[CoziApiClient] Fetching list: ${listId}`);
    }

    try {
      const response = await this.client.get<CoziList>(`/api/ext/2004/${this.accountId}/list/${listId}`);

      if (this.debug) {
        console.log(`[CoziApiClient] Found list: ${response.data.title}`);
      }

      return response.data;
    } catch (error) {
      if (this.debug) {
        console.error(`[CoziApiClient] Failed to fetch list ${listId}:`, error);
      }
      throw error;
    }
  }

  /**
   * Add a new list
   *
   * @param request - List creation request
   * @returns The ID of the created list
   *
   * @example
   * ```typescript
   * const listId = await client.addList({
   *   title: 'Grocery Shopping',
   *   type: 'shopping'
   * });
   * console.log('Created list:', listId);
   * ```
   */
  async addList(request: AddListRequest): Promise<string> {
    if (this.debug) {
      console.log('[CoziApiClient] Adding list:', request);
    }

    try {
      const response = await this.client.post<{ listId: string }>('/lists', request);

      if (this.debug) {
        console.log('[CoziApiClient] Created list:', response.data.listId);
      }

      return response.data.listId;
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to add list:', error);
      }
      throw error;
    }
  }

  /**
   * Remove a list
   *
   * @param listId - The ID of the list to remove
   *
   * @example
   * ```typescript
   * await client.removeList('list-id-to-delete');
   * ```
   */
  async removeList(listId: string): Promise<void> {
    if (this.debug) {
      console.log(`[CoziApiClient] Removing list: ${listId}`);
    }

    try {
      await this.client.delete(`/lists/${listId}`);

      if (this.debug) {
        console.log('[CoziApiClient] List removed successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to remove list:', error);
      }
      throw error;
    }
  }

  /**
   * Reorder a list
   *
   * @param request - List reorder request
   *
   * @example
   * ```typescript
   * await client.reorderList({
   *   listId: 'list-id',
   *   newOrder: 2
   * });
   * ```
   */
  async reorderList(request: ReorderListRequest): Promise<void> {
    if (this.debug) {
      console.log('[CoziApiClient] Reordering list:', request);
    }

    try {
      await this.client.patch(`/lists/${request.listId}/order`, {
        order: request.newOrder,
      });

      if (this.debug) {
        console.log('[CoziApiClient] List reordered successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to reorder list:', error);
      }
      throw error;
    }
  }

  /**
   * Add an item to a list
   *
   * @param request - Item creation request
   *
   * @example
   * ```typescript
   * await client.addItem({
   *   listId: 'shopping-list-id',
   *   text: 'Milk'
   * });
   * ```
   */
  async addItem(request: AddItemRequest): Promise<void> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    if (this.debug) {
      console.log('[CoziApiClient] Adding item:', request);
    }

    try {
      await this.client.post(`/api/ext/2004/${this.accountId}/list/${request.listId}/item/`, {
        text: request.text,
      });

      if (this.debug) {
        console.log('[CoziApiClient] Item added successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to add item:', error);
      }
      throw error;
    }
  }

  /**
   * Edit an item
   *
   * @param request - Item edit request
   *
   * @example
   * ```typescript
   * await client.editItem({
   *   listId: 'shopping-list-id',
   *   itemId: 'item-id',
   *   text: 'Whole Milk'
   * });
   * ```
   */
  async editItem(request: EditItemRequest): Promise<void> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    if (this.debug) {
      console.log('[CoziApiClient] Editing item:', request);
    }

    try {
      await this.client.put(
        `/api/ext/2004/${this.accountId}/list/${request.listId}/item/${request.itemId}`,
        { text: request.text }
      );

      if (this.debug) {
        console.log('[CoziApiClient] Item edited successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to edit item:', error);
      }
      throw error;
    }
  }

  /**
   * Mark an item as completed/incomplete
   *
   * @param request - Item mark request
   *
   * @example
   * ```typescript
   * // Mark as complete
   * await client.markItem({
   *   listId: 'shopping-list-id',
   *   itemId: 'item-id',
   *   completed: true
   * });
   *
   * // Mark as incomplete
   * await client.markItem({
   *   listId: 'shopping-list-id',
   *   itemId: 'item-id',
   *   completed: false
   * });
   * ```
   */
  async markItem(request: MarkItemRequest): Promise<void> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    const status = request.completed ? 'complete' : 'incomplete';

    if (this.debug) {
      console.log(`[CoziApiClient] Marking item as ${status}:`, request);
    }

    try {
      await this.client.put(
        `/api/ext/2004/${this.accountId}/list/${request.listId}/item/${request.itemId}`,
        { status }
      );

      if (this.debug) {
        console.log(`[CoziApiClient] Item marked as ${status} successfully`);
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to mark item:', error);
      }
      throw error;
    }
  }

  /**
   * Remove an item from a list
   *
   * @param request - Item removal request
   *
   * @example
   * ```typescript
   * await client.removeItem({
   *   listId: 'shopping-list-id',
   *   itemId: 'item-id'
   * });
   * ```
   */
  async removeItem(request: RemoveItemRequest): Promise<void> {
    if (!this.accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }

    if (this.debug) {
      console.log('[CoziApiClient] Removing item:', request);
    }

    try {
      await this.client.delete(
        `/api/ext/2004/${this.accountId}/list/${request.listId}/item/${request.itemId}`
      );

      if (this.debug) {
        console.log('[CoziApiClient] Item removed successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('[CoziApiClient] Failed to remove item:', error);
      }
      throw error;
    }
  }
}
