import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  describe('initial state', () => {
    it('should have null user', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should not be authenticated', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and mark as authenticated', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer' as const,
        profile: { name: 'Test User' },
      };

      useAuthStore.getState().setUser(mockUser);

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should update user when called again', () => {
      const user1 = {
        id: 1,
        email: 'user1@example.com',
        role: 'customer' as const,
        profile: { name: 'User 1' },
      };
      const user2 = {
        id: 2,
        email: 'user2@example.com',
        role: 'vendor' as const,
        profile: { name: 'User 2' },
      };

      useAuthStore.getState().setUser(user1);
      useAuthStore.getState().setUser(user2);

      expect(useAuthStore.getState().user).toEqual(user2);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear user and mark as not authenticated', () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'customer' as const,
        profile: { name: 'Test User' },
      };

      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should handle logout when not logged in', () => {
      expect(() => useAuthStore.getState().logout()).not.toThrow();
    });
  });
});
