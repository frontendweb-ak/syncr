import type { createDb } from './client'

export type Db = ReturnType<typeof createDb>

export type Transaction = Parameters<Db['transaction']>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never

export type TransactionCallback<T> = (tx: Transaction) => Promise<T>
