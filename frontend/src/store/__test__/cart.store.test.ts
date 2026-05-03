import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, CartItem } from '../cart.store';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  describe('addItem', () => {
    it('should add a new item to cart', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0]).toEqual(item);
    });

    it('should increase quantity when adding existing item', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().addItem(item);

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('should add different items separately', () => {
      const item1: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };
      const item2: CartItem = {
        id: 2,
        name: 'Product 2',
        price: 200000,
        quantity: 1,
        shop: 'Shop B',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);

      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item by id', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().removeItem(1);

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('should not affect other items when removing', () => {
      const item1: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };
      const item2: CartItem = {
        id: 2,
        name: 'Product 2',
        price: 200000,
        quantity: 1,
        shop: 'Shop B',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);
      useCartStore.getState().removeItem(1);

      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].id).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('should increase quantity', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().updateQuantity(1, 2);

      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });

    it('should decrease quantity', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 5,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().updateQuantity(1, -2);

      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });

    it('should not go below 1', () => {
      const item: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().updateQuantity(1, -1);

      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should remove all items', () => {
      const item1: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 1,
        shop: 'Shop A',
      };
      const item2: CartItem = {
        id: 2,
        name: 'Product 2',
        price: 200000,
        quantity: 1,
        shop: 'Shop B',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);
      useCartStore.getState().clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('should return total quantity of all items', () => {
      const item1: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 2,
        shop: 'Shop A',
      };
      const item2: CartItem = {
        id: 2,
        name: 'Product 2',
        price: 200000,
        quantity: 3,
        shop: 'Shop B',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);

      expect(useCartStore.getState().getTotalItems()).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getTotalItems()).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should return total price of all items', () => {
      const item1: CartItem = {
        id: 1,
        name: 'Product 1',
        price: 100000,
        quantity: 2,
        shop: 'Shop A',
      };
      const item2: CartItem = {
        id: 2,
        name: 'Product 2',
        price: 50000,
        quantity: 3,
        shop: 'Shop B',
      };

      useCartStore.getState().addItem(item1);
      useCartStore.getState().addItem(item2);

      expect(useCartStore.getState().getTotalPrice()).toBe(350000);
    });

    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getTotalPrice()).toBe(0);
    });
  });
});
