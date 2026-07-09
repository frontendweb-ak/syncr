import type { Db, TransactionCallback } from './types'

export async function withTransaction<T>(db: Db, callback: TransactionCallback<T>): Promise<T> {
  return db.transaction(callback)
}
