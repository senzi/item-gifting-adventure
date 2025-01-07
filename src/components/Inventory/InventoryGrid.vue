<template>
  <div class="inventory-grid">
    <div
      v-for="(slot, index) in slots"
      :key="index"
      class="inventory-slot"
      :class="{ 'selected': selectedIndex === index }"
      :style="slot ? { backgroundColor: slot.backgroundColor } : {}"
      @click="selectSlot(index)"
    >
      <template v-if="slot">
        <div class="item-icon">{{ slot.name[0].toUpperCase() }}</div>
      </template>
      <div v-else class="empty-slot">
        <span>+</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '../../types/item'

const props = defineProps<{
  items: (Item | null)[]
  maxSlots?: number
  selectedIndex?: number
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

const slots = computed(() => {
  const slotsArray = [...props.items]
  const maxSlots = props.maxSlots || 10
  while (slotsArray.length < maxSlots) {
    slotsArray.push(null)
  }
  return slotsArray
})

const selectSlot = (index: number) => {
  emit('select', index)
}
</script>

<style scoped>
.inventory-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.inventory-slot {
  aspect-ratio: 1;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.inventory-slot:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.inventory-slot.selected {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5);
}

.item-icon {
  width: 50px;
  height: 50px;
  background: white;
  color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-slot {
  color: #999;
  font-size: 2rem;
}
</style>
