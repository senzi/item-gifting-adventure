export interface Level {
  id: number;                 // 第几关
  name: string;              // 关卡名字
  description: string;       // 关卡描述
  npcDefaultDialog: string;  // NPC默认对话
  npcJudgePrompt: string;    // NPC判断是否能过关的Prompt
  npcAvatar: string;         // NPC头像URL
}

export interface LevelResponse {
  passed: boolean;           // 是否过关
  npcReply: string;         // NPC的回复
}
