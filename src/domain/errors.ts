import type { Dict } from '../types';


export class Exception extends Error {
  [key: string]: any;
  
  public readonly message: string;
  public readonly name: string;

  constructor(message?: string, contextObject?: Dict<unknown>) {
    super(message);
    
    this.message = message ?? '';
    this.name = 'Exception';

    if(typeof contextObject === 'object' && Object.keys(contextObject).length > 0) {
      for(const prop in contextObject) {
        if(['name', 'message', 'cause', 'stack'].includes(prop)) continue;
        (this as unknown as Dict<any>)[prop] = contextObject[prop];
      }
    }
  }
}


export class InvalidIPAddress extends Exception {

  /**
   * Readonly property holding the name of the exception.
   */
  public readonly name = 'InvalidIPAddress' as const;

  /**
   * Readonly property holding the status code of the exception (default is `422 Unprocessable Entity`).
   */
  public readonly statusCode: number;

  /**
   * Constructor for the InvalidIPAddress class.
   * 
   * @param {string} message An error message for the exception
   * @param {number} status (Optional) The status code of the exception (default is `422 Unprocessable Entity`
   * @param {Dict<any>} context (Optional) A context object for the exception
   */
  constructor(message: string, status?: number, context?: Dict<any>) {
    super(message, context);
    this.statusCode = status && status >= 400 && status <= 511 ? status : 422;
  }
}


export class AuthError extends Exception {
  public override readonly name = 'AuthError' as const;
  
  constructor(message: string, statusCode: number, type: string, context?: Dict<any>) {
    super(message, { ...context, statusCode, type });
  }
}

export default Exception;