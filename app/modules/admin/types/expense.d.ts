type ExpenseType = 'PURCHASE' | 'LOGISTICS' | 'ADVERTISING' | 'PACKAGING' | 'SALARY' | 'SERVICES' | 'RETURN' | 'OTHER'

interface Expense {
  id: number
  title: string
  type: ExpenseType
  amount: number
  expenseDate: string
  note: string | null
  createdAt: string
  updatedAt: string
}

interface CreateExpenseDto {
  title: string
  type: ExpenseType
  amount: number
  expenseDate: string
  note?: string
}

interface UpdateExpenseDto {
  title?: string
  type?: ExpenseType
  amount?: number
  expenseDate?: string
  note?: string
}
