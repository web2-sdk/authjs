import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextFunction, Request, Response } from 'express';


/**
 * A type that can be any of the following:
 * - bigint
 * - boolean
 * - function
 * - number
 * - object
 * - string
 * - symbol
 * - undefined
 */
export type DataType =
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'object'
  | 'string'
  | 'symbol'
  | 'undefined';


/**
 * A dictionary type.
 */
export type Dict<T> = {
  [key: string]: T;
}


/**
 * A type that can be a value or an array of values.
 */
export type MaybeArray<T> = T | T[];


/**
 * A type that can be a promise or not.
 */
export type MaybePromise<T> = T | Promise<T>;


/**
 * The type of the authentication provider.
 */
export type ProviderType = 'oidc' | 'oauth' | 'email' | 'credentials';


/**
 * Next.JS request handler
 */
export type NextRequestHandler = ((request: NextApiRequest, response: NextApiResponse) => Promise<void>);

/**
 * Next.JS request middleware
 */
export type NextLegacyMiddleware = ((request: NextApiRequest, response: NextApiResponse, nextCallback: NextRequestHandler) => Promise<void>);


/**
 * Express request handler
 */
export type ExpressRequestHandler = ((request: Request, response: Response) => Promise<void>);

/**
 * Express request middleware
 */
export type ExpressMiddleware = ((request: Request, response: Response, next: NextFunction) => Promise<void>)
