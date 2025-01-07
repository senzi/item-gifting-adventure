export interface Item {
  id: string
  name: string
  description: string
  weight: number
  value: number
  backgroundColor: string
  submitted?: boolean  // 标记物品是否已经被提交过
}

export interface ItemGenerateResponse {
  name: string
  description: string
  weight: number
  value: number
  backgroundColor: string
}
