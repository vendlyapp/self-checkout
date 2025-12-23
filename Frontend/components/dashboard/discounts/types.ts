export interface DiscountCode {
  id: string
  code: string
  status: 'active' | 'inactive' | 'archived'
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  current_redemptions: number
  max_redemptions: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  archived?: boolean
  created_at: string
  updated_at: string
}

