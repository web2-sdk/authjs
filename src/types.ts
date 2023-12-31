
export type DataType =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';


export type Dict<T> = {
  [key: string]: T;
}


export type MaybeArray<T> = T | T[];

export type MaybePromise<T> = T | Promise<T>;


export type ProviderType = 'oidc' | 'oauth' | 'email' | 'credentials'