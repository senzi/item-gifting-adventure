<script setup lang="ts">
import { ref, computed } from 'vue'
import ItemGenerator from './components/Generator/ItemGenerator.vue'
import InventoryGrid from './components/Inventory/InventoryGrid.vue'
import ItemDetail from './components/Inventory/ItemDetail.vue'
import LevelCard from './components/Level/LevelCard.vue'
import { ConfigButton, ConfigModal } from './components/LLMConfig'
import { useLevelStore } from './stores/level'
import { useInventoryStore } from './stores/inventory'
import type { Item, ItemGenerateResponse } from './types/item'

const levelStore = useLevelStore()
const inventoryStore = useInventoryStore()

const showConfig = ref(false)
const selectedItemIndex = ref(-1)
const levelCardRef = ref<InstanceType<typeof LevelCard> | null>(null)

const selectedItem = computed(() => {
  if (selectedItemIndex.value === -1) {
    return null
  }
  return inventoryStore.items[selectedItemIndex.value] || null
})

const handleItemGenerated = (item: ItemGenerateResponse) => {
  try {
    inventoryStore.addItem(item)
  } catch (error) {
  }
}

const handleGiveItem = async () => {
  if (!selectedItem.value || !levelStore.currentLevel) return

  // 检查物品是否已经提交过
  if (selectedItem.value.submitted) {
    levelCardRef.value?.updateDialog("我说过了，这个东西我不要")
    return // 直接返回，不继续执行
  }

  try {
    const response = await levelStore.submitItem({
      levelId: levelStore.currentLevel.id,
      itemInfo: selectedItem.value,
      prompt: levelStore.currentLevel.npcJudgePrompt
    })

    // 更新NPC对话
    levelCardRef.value?.updateDialog(response.npcReply)

    if (response.passed) {
      // 从背包中移除物品
      inventoryStore.removeItem(selectedItem.value.id)
      // 取消选中状态
      selectedItemIndex.value = -1
      // 显示下一关按钮
      levelCardRef.value?.showNextLevelButton()
    }
  } catch (error) {
    console.error('Error submitting item:', error)
    levelCardRef.value?.updateDialog("抱歉，我现在有点忙，稍后再试试吧")
  }
}

const handleLevelComplete = () => {
  // 隐藏下一关按钮
  levelCardRef.value?.hideNextLevelButton()
  // 切换到下一关
  levelStore.nextLevel()
}

const handleItemDrop = async (item: Item) => {
  if (!levelStore.currentLevel || !item) return

  const response = await levelStore.submitItem({
    levelId: levelStore.currentLevel.id,
    itemInfo: item,
    prompt: levelStore.currentLevel.npcJudgePrompt
  })

  if (response.passed) {
    inventoryStore.removeItem(item.id)
    selectedItemIndex.value = -1
  }
}
</script>

<template>
  <div class="app-container">
    <ConfigButton class="config-button" @click="showConfig = true" />
    
    <div class="game-content">
      <div class="level-section">
        <LevelCard
          v-if="levelStore.currentLevel || levelStore.isGameCompleted"
          ref="levelCardRef"
          :level="levelStore.currentLevel || levelStore.levels[levelStore.levels.length - 1]"
          @level-complete="handleLevelComplete"
        />
      </div>

      <div class="main-section">
        <div class="item-detail-section">
          <ItemDetail
            :item="selectedItem"
            @give="handleGiveItem"
          />
        </div>

        <div class="inventory-section">
          <InventoryGrid
            :items="inventoryStore.items"
            :selected-index="selectedItemIndex"
            @select="selectedItemIndex = $event"
            @drop="handleItemDrop"
          />
        </div>

        <div class="generator-section">
          <ItemGenerator 
            :inventory-count="inventoryStore.items.length"
            @item-generated="handleItemGenerated" 
          />
        </div>
      </div>
    </div>

    <ConfigModal
      v-model="showConfig"
    />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  gap: 1rem;
}

.game-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  align-items: center;
}

.level-section {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.main-section {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.item-detail-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.inventory-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.generator-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
}
</style>
