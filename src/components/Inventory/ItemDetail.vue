<template>
  <div class="item-detail">
    <template v-if="item">
      <h3>{{ item.name }}</h3>
      <p class="description">{{ item.description }}</p>
      <div class="stats">
        <div class="stat">
          <span class="label">重量:</span>
          <span>{{ item.weight }}kg</span>
        </div>
        <div class="stat">
          <span class="label">价值:</span>
          <span>{{ item.value }}金币</span>
        </div>
      </div>
      <button class="give-button" @click="$emit('give')">
        赠送物品
      </button>
    </template>
    <div v-else class="empty-state">
      <p>选择一个物品查看详情</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Item } from '../../types/item'

defineProps<{
  item: Item | null
}>()

defineEmits<{
  (e: 'give'): void
}>()
</script>

<style scoped>
.item-detail {
  padding: 1rem;
  min-height: 200px;
}

h3 {
  margin: 0 0 1rem;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
}

.label {
  color: #666;
  margin-right: 0.5rem;
}

.give-button {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.give-button:hover {
  background: #45a049;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>
