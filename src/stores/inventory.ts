import { defineStore } from 'pinia';
import type { Item, ItemGenerateResponse } from '@/types/item';
import { v4 as uuidv4 } from 'uuid';

interface InventoryState {
  items: Item[];
}

const STORAGE_KEY = 'inventory-items';

export const useInventoryStore = defineStore('inventory', {
  state: (): InventoryState => ({
    items: loadItems()
  }),

  actions: {
    addItem(itemInfo: ItemGenerateResponse) {
      console.log('添加物品到store:', itemInfo)
      // 确保设置必要的属性
      const item: Item = {
        id: uuidv4(),
        name: itemInfo.name,
        description: itemInfo.description,
        weight: itemInfo.weight,
        value: itemInfo.value,
        backgroundColor: itemInfo.backgroundColor,
        submitted: false  // 新物品默认未提交
      }
      console.log('转换后的物品:', item)
      this.items.push(item);
      saveItems(this.items);
      console.log('保存后的库存:', this.items)
    },

    removeItem(itemId: string) {
      const index = this.items.findIndex(item => item.id === itemId);
      if (index !== -1) {
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
