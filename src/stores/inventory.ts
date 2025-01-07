import { defineStore } from 'pinia';
import type { Item } from '../types/item';

interface InventoryState {
  items: Item[];
}

const STORAGE_KEY = 'inventory-items';

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: loadItems()
  }),

  actions: {
    addItem(item: Item) {
      console.log('添加物品到store:', item)
      this.items.push(item);
      saveItems(this.items);
      console.log('保存后的库存:', this.items)
    },

    removeItem(item: Item) {
      const index = this.items.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.items.splice(index, 1);
        saveItems(this.items);
      }
    },

    getItem(itemId: string): Item | undefined {
      return this.items.find(item => item.id === itemId);
    }
  }
});

// 从 localStorage 加载物品
function loadItems(): Item[] {
  const savedItems = localStorage.getItem(STORAGE_KEY);
  return savedItems ? JSON.parse(savedItems) : [];
}

// 保存物品到 localStorage
function saveItems(items: Item[]) {
  console.log('保存到localStorage的物品:', items)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
