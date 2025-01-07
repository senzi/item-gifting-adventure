import { defineStore } from 'pinia';
import type { Level, LevelResponse } from '../types/level';
import type { Item } from '../types/item';

interface LevelState {
  currentLevelId: number;
  levels: Level[];
}

const INITIAL_LEVELS: Level[] = [
  {
    id: 1,
    name: "森林守护者的考验",
    description: "在这片神秘的森林里，住着一位慈祥的精灵守护者。她在寻找能够帮助森林生长的宝物。",
    npcDefaultDialog: "欢迎来到我的森林，年轻的冒险者。你带来了什么礼物吗？",
    npcJudgePrompt: `你是一位森林精灵守护者，正在寻找能够帮助森林生长的宝物。
玩家会给你一件物品，你需要判断这件物品是否对森林有帮助。
你的回复必须是一个JSON对象，格式如下：
{
  "accept": true/false,  // 是否接受这个物品
  "reply": "你的回复"    // 对玩家说的话，解释为什么接受或拒绝
}

如果物品对森林有帮助（比如种子、水、肥料等），就接受它；如果物品对森林有害或无关，就拒绝它。
请根据物品的描述做出合理的判断。`,
    npcAvatar: "/assets/forest-guardian.png"
  },
  {
    id: 2,
    name: "海洋守护者的嘱托",
    description: "在碧蓝的海域深处，栖息着一位智慧的海洋守护者。她正在寻找能够保护海洋生态的珍贵物品。",
    npcDefaultDialog: "欢迎来到广阔的海域，勇敢的探索者。你为我们的海洋带来了什么吗？",
    npcJudgePrompt: `你是一位海洋守护者，致力于保护海洋生态环境。
玩家会给你一件物品，你需要判断这件物品是否对海洋生态有益。
你的回复必须是一个JSON对象，格式如下：
{
  "accept": true/false,  // 是否接受这个物品
  "reply": "你的回复"    // 对玩家说的话，解释为什么接受或拒绝
}

如果物品对海洋生态有益（比如清洁工具、可降解材料、净化装置等），就接受它；
如果物品可能污染海洋或危害海洋生物（如塑料制品、化学品等），就拒绝它；
如果物品与海洋保护无关，也要婉拒。

请根据物品的特性和对海洋环境的潜在影响做出合理判断。回复时要体现出对海洋生态的关心。`,
    npcAvatar: "/assets/ocean-guardian.png"
  },
  {
    id: 3,
    name: "商人的智慧考验",
    description: "在繁华的集市中，有位见多识广的商人。他在寻找真正有价值的宝物，但他的标准很特别。",
    npcDefaultDialog: "这位冒险者，让我看看你带来了什么珍贵的物品。记住，真正的价值不仅仅在于表面。",
    npcJudgePrompt: `你是一位睿智的商人，在寻找真正珍贵的宝物。
玩家会给你一件物品，你需要判断这件物品是否符合要求。
你的回复必须是一个JSON对象，格式如下：
{
  "accept": true/false,  // 是否接受这个物品
  "reply": "你的回复"    // 对玩家说的话，解释为什么接受或拒绝
}

判断标准：
1. 物品的价值必须超过200金币
2. 物品本身要有实际用途或收藏价值
3. 不接受来路不明或非法的物品

如果物品不够珍贵（价值低于200金币），要委婉提醒玩家寻找更有价值的物品。
如果物品价值足够但不适合收藏或缺乏实用性，也要说明原因并拒绝。`,
    npcAvatar: "/assets/merchant-sage.png"
},
];

export const useLevelStore = defineStore('level', {
  state: (): LevelState => {
    // 从本地存储读取当前关卡ID
    const savedLevelId = localStorage.getItem('currentLevelId')
    return {
      currentLevelId: savedLevelId ? parseInt(savedLevelId) : 1,
      levels: INITIAL_LEVELS
    }
  },

  getters: {
    currentLevel(): Level | undefined {
      return this.levels.find(level => level.id === this.currentLevelId);
    },

    isGameCompleted(): boolean {
      // 检查是否已经通过所有关卡
      return this.currentLevelId > this.levels.length;
    }
  },

  actions: {
    async submitItem({ levelId, itemInfo, prompt }: {
      levelId: number,
      itemInfo: Item,
      prompt: string
    }): Promise<LevelResponse> {
      // 检查物品是否已经提交过
      if (itemInfo.submitted) {
        return {
          passed: false,
          npcReply: "我说过了，这个东西我不要"
        };
      }

      // 在调用 LLM 之前就标记物品为已提交
      itemInfo.submitted = true;

      const config = localStorage.getItem('llm-config')
      if (!config) {
        // 如果配置出错，移除提交标记
        itemInfo.submitted = false;
        throw new Error('请先配置LLM API')
      }

      try {
        const { baseUrl, apiKey, model } = JSON.parse(config)
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: prompt
              },
              {
                role: 'user',
                content: `这是玩家给你的物品：
名称：${itemInfo.name}
描述：${itemInfo.description}
重量：${itemInfo.weight}kg
价值：${itemInfo.value}金币

请判断是否接受这个物品。`
              }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
          })
        });

        if (!response.ok) {
          // 如果 API 调用失败，移除提交标记
          itemInfo.submitted = false;
          throw new Error('API请求失败');
        }

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        // 确保返回值符合预期格式
        if (typeof result.accept !== 'boolean' || typeof result.reply !== 'string') {
          // 如果返回格式错误，移除提交标记
          itemInfo.submitted = false;
          throw new Error('API返回格式错误');
        }
        return {
          passed: result.accept,
          npcReply: result.reply
        };
      } catch (error) {
        // 如果发生任何错误，移除提交标记
        itemInfo.submitted = false;
        console.error('Error submitting item:', error);
        throw error;
      }
    },

    nextLevel() {
      this.currentLevelId++;
      // 保存当前关卡ID到本地存储
      localStorage.setItem('currentLevelId', this.currentLevelId.toString());
    }
  }
});
