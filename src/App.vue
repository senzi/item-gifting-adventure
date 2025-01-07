<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ConfigButton, ConfigModal } from './components/LLMConfig'
import InventoryGrid from './components/Inventory/InventoryGrid.vue'
import ItemDetail from './components/Inventory/ItemDetail.vue'
import ItemGenerator from './components/Generator/ItemGenerator.vue'
import type { Item, ItemGenerateResponse } from './types/item'

const STORAGE_KEY = 'inventory-items'

const showConfig = ref(false)
const items = ref<Item[]>([])
const selectedItemIndex = ref(-1)

const selectedItem = computed(() => {
  if (selectedItemIndex.value === -1 || !items.value[selectedItemIndex.value]) {
    return null
  }
  return items.value[selectedItemIndex.value]
})

// 监听物品变化并保存到localStorage
watch(items, (newItems) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
}, { deep: true })

// 组件加载时从localStorage读取物品数据
onMounted(() => {
  const savedItems = localStorage.getItem(STORAGE_KEY)
  if (savedItems) {
    try {
      items.value = JSON.parse(savedItems)
    } catch (e) {
      console.error('Failed to load inventory items:', e)
    }
  }
})

const handleItemGenerated = (itemData: ItemGenerateResponse) => {
  if (items.value.length >= 10) {
    alert('物品栏已满！')
    return
  }
  
  const newItem: Item = {
    id: crypto.randomUUID(),
    ...itemData
  }
  
  items.value.push(newItem)
  selectedItemIndex.value = items.value.length - 1
}

const handleGiveItem = () => {
  if (selectedItemIndex.value >= 0) {
    items.value.splice(selectedItemIndex.value, 1)
    selectedItemIndex.value = -1
  }
}
</script>

<template>
  <div class="app-container">
    <ConfigButton @click="showConfig = true" />
    <ConfigModal v-model="showConfig" />
    
    <div class="game-container">
      <div class="card npc-card">
        <!-- NPC卡片内容将在这里添加 -->
      </div>
      
      <div class="card inventory-card">
        <ItemDetail
          :item="selectedItem"
          @give="handleGiveItem"
        />
        <InventoryGrid
          :items="items"
          :selected-index="selectedItemIndex"
          @select="selectedItemIndex = $event"
        />
      </div>
      
      <div class="card generator-card">
        <ItemGenerator 
          @generated="handleItemGenerated"
          :inventory-count="items.length"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.app-container {
  min-height: 100vh;
  padding: 1rem;
}

.game-container {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 2rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;
}

.npc-card {
  min-height: 200px;
}

.inventory-card {
  min-height: 300px;
}

.generator-card {
  min-height: 200px;
}
</style>
