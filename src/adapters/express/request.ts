import { Request as ExpressRequest } from 'express';

import { uuid } from '../../id';
import { now } from '../../utils';
import * as inet from '../../lib/inet';



/**
 * Represents the client's internet connection information.
 */
export interface RequestInet {

  /** The client's IP address as an IPv4 or IPv6 object. */
  readonly ip: inet.IPv4 | inet.IPv6;
}

/**
 * Represents an extended HTTP request object, a subclass of the native `http.IncomingMessage` class.
 * 
 * Additions to the native class are:
 * 
 * - `requestId` - a unique request identifier
 * 
 * - `requestTime` - the time the request was received
 * 
 * - `context` - an extensible object for storing request-specific data
 * 
 * - `inet` - some information about the client's internet connection
 * 
 *    - `ip` - the client's IP address
 */
export interface ExtendedRequest extends ExpressRequest {

  /** An unique identifier for this request instance */
  readonly requestId: string;

  /** The precise timestamp when the request was received */
  readonly requestTime: number;

  /** An extensible object for storing request-specific data */
  readonly context: { readonly [key: string]: any };

  /** Information about the client's internet connection */
  readonly inet: RequestInet;
}


/**
 * Extends an Express request object with additional properties.
 * 
 * @param {ExpressRequest} req The Express request object to extend 
 * @returns {ExtendedRequest} The extended request object
 */
export function extendExpressRequest(req: ExpressRequest): ExtendedRequest {
  if(!Object.prototype.hasOwnProperty.call(req, 'requestId')) {
    Object.assign(req, { requestId: uuid().replace(/-/g, '') });
  }

  if(!Object.prototype.hasOwnProperty.call(req, 'context')) {
    Object.assign(req, { context: {} });
  }

  if(!Object.prototype.hasOwnProperty.call(req, 'inet')) {
    Object.assign(req, { inet: { ip: inet.extractIPFromRequest(req) } });
  }

  if(!Object.prototype.hasOwnProperty.call(req, 'requestTime')) {
    Object.assign(req, { requestTime: now() });
  }

  return req as ExtendedRequest;
}