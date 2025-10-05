/**
 * Type definition tests
 */

import type {
  CoziCredentials,
  CoziList,
  CoziItem,
  CoziAuthResponse,
  AddListRequest,
  AddItemRequest,
} from '../types';

describe('Type Definitions', () => {
  describe('CoziCredentials', () => {
    it('should have correct structure', () => {
      const credentials: CoziCredentials = {
        username: 'test@example.com',
        password: 'password123',
      };

      expect(credentials).toHaveProperty('username');
      expect(credentials).toHaveProperty('password');
    });
  });

  describe('CoziAuthResponse', () => {
    it('should have correct structure', () => {
      const authResponse: CoziAuthResponse = {
        accountId: 'account-123',
        accountPersonId: 'person-456',
        accessToken: 'token-789',
        expiresIn: 3600,
      };

      expect(authResponse).toHaveProperty('accountId');
      expect(authResponse).toHaveProperty('accountPersonId');
      expect(authResponse).toHaveProperty('accessToken');
      expect(authResponse).toHaveProperty('expiresIn');
    });
  });

  describe('CoziList', () => {
    it('should have correct structure', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Shopping List',
        listType: 'shopping',
        items: [],
        version: 1,
      };

      expect(list).toHaveProperty('listId');
      expect(list).toHaveProperty('title');
      expect(list).toHaveProperty('listType');
      expect(list).toHaveProperty('items');
      expect(list).toHaveProperty('version');
    });

    it('should support shopping list type', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Shopping List',
        listType: 'shopping',
        items: [],
        version: 1,
      };

      expect(list.listType).toBe('shopping');
    });

    it('should support todo list type', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Todo List',
        listType: 'todo',
        items: [],
        version: 1,
      };

      expect(list.listType).toBe('todo');
    });
  });

  describe('CoziItem', () => {
    it('should have correct structure', () => {
      const item: CoziItem = {
        itemId: 'item-123',
        text: 'Buy milk',
        status: 'incomplete',
        version: 1,
      };

      expect(item).toHaveProperty('itemId');
      expect(item).toHaveProperty('text');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('version');
    });

    it('should support complete status', () => {
      const item: CoziItem = {
        itemId: 'item-123',
        text: 'Buy milk',
        status: 'complete',
        version: 1,
      };

      expect(item.status).toBe('complete');
    });

    it('should support incomplete status', () => {
      const item: CoziItem = {
        itemId: 'item-123',
        text: 'Buy milk',
        status: 'incomplete',
        version: 1,
      };

      expect(item.status).toBe('incomplete');
    });
  });

  describe('Request Types', () => {
    it('AddListRequest should have correct structure', () => {
      const request: AddListRequest = {
        title: 'New List',
        type: 'shopping',
      };

      expect(request).toHaveProperty('title');
      expect(request).toHaveProperty('type');
    });

    it('AddItemRequest should have correct structure', () => {
      const request: AddItemRequest = {
        listId: 'list-123',
        text: 'New item',
      };

      expect(request).toHaveProperty('listId');
      expect(request).toHaveProperty('text');
    });
  });
});
