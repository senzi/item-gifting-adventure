<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Level } from '../../types/level'
import { useLevelStore } from '../../stores/level'

const props = defineProps<{
  level: Level
  onLevelComplete?: () => void
}>()

const levelStore = useLevelStore()
const dialogText = ref(props.level.description)
const showNextButton = ref(false)

// 监听关卡变化
watch(() => props.level, (newLevel) => {
  dialogText.value = newLevel.description
  showNextButton.value = false
}, { immediate: true })

// NPC头像点击处理
const handleNpcClick = () => {
  if (!showNextButton.value) {
    dialogText.value = props.level.npcDefaultDialog
  }
}

const emit = defineEmits(['level-complete'])

// 更新NPC对话
const updateDialog = (text: string) => {
  dialogText.value = text
}

// 显示下一关按钮
const showNextLevelButton = () => {
  showNextButton.value = true
}

// 隐藏下一关按钮
const hideNextLevelButton = () => {
  showNextButton.value = false
}

defineExpose({
  updateDialog,
  showNextLevelButton,
  hideNextLevelButton
})
</script>

<template>
  <div class="level-card">
    <div v-if="levelStore.isGameCompleted" class="game-completed">
      <h2>🎉 恭喜通关！</h2>
      <p>你已经完成了所有关卡，感谢游玩！</p>
    </div>
    <template v-else>
      <div class="level-header">
        <h2>第{{ level.id }}关：{{ level.name }}</h2>
      </div>
      
      <div class="npc-section">
        <img 
          :src="level.npcAvatar" 
          class="npc-avatar" 
          @click="handleNpcClick"
        >
        <div class="dialog-box">
          <p>{{ dialogText }}</p>
        </div>
      </div>

      <button 
        v-if="showNextButton" 
        class="next-level-button"
        @click="emit('level-complete')"
      >
        下一关 →
      </button>
    </template>
  </div>
</template>

<style scoped>
.level-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.level-header {
  margin-bottom: 16px;
}

.level-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5em;
}

.level-content {
  display: flex;
  gap: 20px;
}

.npc-section {
  flex: 0 0 120px;
}

.npc-avatar {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  cursor: pointer;
  transition: transform 0.2s;
  object-fit: cover;
}

.npc-avatar:hover {
  transform: scale(1.05);
}

.dialog-section {
  flex: 1;
}

.dialog-bubble {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  min-height: 60px;
}

.dialog-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 20px;
  border-style: solid;
  border-width: 10px 10px 10px 0;
  border-color: transparent #f5f5f5 transparent transparent;
}

.next-level-button-container {
  margin-top: 16px;
  text-align: right;
}

.next-level-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s;
}

.next-level-button:hover {
  background-color: #45a049;
}

.game-completed {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-completed h2 {
  color: #4CAF50;
  margin-bottom: 1rem;
}

.game-completed p {
  color: #666;
  font-size: 1.1rem;
}
</style>
