<template>
  <div class="item-generator">
    <div class="input-area">
      <textarea
        v-model="description"
        placeholder="描述你想要生成的物品..."
        :disabled="isGenerating || isFull"
        rows="4"
      ></textarea>
      <button 
        class="generate-button"
        @click="generateItem"
        :disabled="!canGenerate || isFull"
      >
        {{ buttonText }}
      </button>
    </div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ItemGenerateResponse } from '../../types/item'

const props = defineProps<{
  inventoryCount: number
  maxSlots?: number
}>()

const emit = defineEmits<{
  (e: 'item-generated', item: ItemGenerateResponse): void
}>()

const description = ref('')
const isGenerating = ref(false)
const error = ref('')

const isFull = computed(() => {
  return props.inventoryCount >= (props.maxSlots || 10)
})

const buttonText = computed(() => {
  if (isGenerating.value) return '生成中...'
  if (isFull.value) return '背包已满'
  return '生成物品'
})

const canGenerate = computed(() => {
  return description.value.trim().length > 0 && !isGenerating.value && !isFull.value
})

const generateItem = async () => {
  if (!canGenerate.value) return
  
  error.value = ''
  isGenerating.value = true
  
  try {
    const config = localStorage.getItem('llm-config')
    if (!config) {
      throw new Error('请先配置LLM API')
    }
    
    const { baseUrl, apiKey, model } = JSON.parse(config)
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `你是一个物品生成器。根据用户的描述，生成物品的JSON数据。
物品的详细描述要参考黑暗之魂的风格，在满足用户需求的前提下，预判用户实际想要的东西，但生成了奇怪的东西(也满足需求)。
特别是一些物品的功能，效果，特性，如果用户没有特别说明，就加入一些「和常识相反的」。
比如用户只说生成化肥，那你就生成一个会让植物暴长致死的化肥(因为用户没说功效)。
返回的JSON格式必须严格遵循以下格式：
{
  "name": "物品名称",
  "description": "物品的详细描述",
  "weight": 0.5,  // 物品重量，单位：千克，必须是数字
  "value": 100,   // 物品价值，单位：金币，必须是整数
  "backgroundColor": "#4CAF50"  // 物品的背景色，必须是有效的CSS颜色值，建议使用柔和的颜色
}`
          },
          {
            role: 'user',
            content: description.value
          }
        ]
      })
    })
    
    if (!response.ok) {
      throw new Error('API请求失败')
    }
    
    const data = await response.json()
    console.log('API返回数据:', data)
    const generatedItem = JSON.parse(data.choices[0].message.content)
    console.log('解析后的物品数据:', generatedItem)
    
    // 验证返回的数据格式
    if (!generatedItem.name || !generatedItem.description || 
        typeof generatedItem.weight !== 'number' || 
        typeof generatedItem.value !== 'number' ||
        !generatedItem.backgroundColor) {
      throw new Error('生成的物品数据格式不正确')
    }
    
    // 确保所有必要的字段都存在
    const item: ItemGenerateResponse = {
      name: generatedItem.name,
      description: generatedItem.description,
      weight: generatedItem.weight,
      value: generatedItem.value,
      backgroundColor: generatedItem.backgroundColor
    }
    console.log('发送给父组件的物品数据:', item)
    console.log('开始触发item-generated事件')
    emit('item-generated', item)
    console.log('item-generated事件已触发')
    description.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '生成物品时出错'
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
.item-generator {
  padding: 1rem;
}

.input-area {
  display: flex;
  gap: 1rem;
}

textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
}

textarea:disabled {
  background: #f5f5f5;
}

.generate-button {
  padding: 0 1.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.generate-button:hover:not(:disabled) {
  background: #45a049;
}

.generate-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 0.5rem;
  color: #f44336;
  font-size: 0.875rem;
}
</style>
