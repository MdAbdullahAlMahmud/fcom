export interface User {
    id: number
    username: string
    password: string
    email: string
    phone: string | null
    role: 'user' | 'admin'
    status: 'active' | 'inactive'
    created_at: Date
  }