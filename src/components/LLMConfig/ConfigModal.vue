<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="emit('update:modelValue', false)">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>LLM API 配置</h2>
          <button class="close-button" @click="emit('update:modelValue', false)">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>供应商</label>
            <select v-model="config.provider" @change="handleProviderChange">
              <option value="moonshot">Moonshot</option>
              <option value="deepseek">Deepseek</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="form-group">
            <label>Base URL</label>
            <input 
              type="text" 
              v-model="config.baseUrl"
              :disabled="config.provider !== 'custom'"
            >
          </div>

          <div class="form-group">
            <label>API Key</label>
            <input 
              type="password" 
              v-model="config.apiKey"
              placeholder="请输入您的API密钥"
            >
          </div>

          <div class="form-group">
            <label>模型名称</label>
            <input 
              type="text" 
              v-model="config.model"
              :disabled="config.provider !== 'custom'"
            >
          </div>
        </div>

        <div class="modal-footer">
          <button class="save-button" @click="saveConfig">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

interface LLMConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
}

const defaultConfigs = {
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k'
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  custom: {
    baseUrl: '',
    model: ''
  }
}

const config = ref<LLMConfig>({
  provider: 'moonshot',
  baseUrl: defaultConfigs.moonshot.baseUrl,
  apiKey: '',
  model: defaultConfigs.moonshot.model
})

onMounted(() => {
  const savedConfig = localStorage.getItem('llm-config')
  if (savedConfig) {
    config.value = JSON.parse(savedConfig)
  }
})

const handleProviderChange = () => {
  const provider = config.value.provider
  if (provider !== 'custom') {
    config.value.baseUrl = defaultConfigs[provider].baseUrl
    config.value.model = defaultConfigs[provider].model
  }
}

const saveConfig = () => {
  localStorage.setItem('llm-config', JSON.stringify(config.value))
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.modal-body {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #f5f5f5;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.save-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.save-button:hover {
  background: #45a049;
}
</style>
