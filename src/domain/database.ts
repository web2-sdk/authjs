import type { Dict, MaybePromise } from '../types';



export interface DatabaseDriver {
  // createModel(name: string, schema?: Dict<any>): Promise<void>;
  close(): MaybePromise<void>;
}

export interface DatabaseRepository {
  readonly name: string;
  readonly type: 'sql' | 'non-sql';
  runQuery?: <R>(query: string, options?: Dict<any> & { values?: unknown[] }) => Promise<R>;
  close(): MaybePromise<void>;
}