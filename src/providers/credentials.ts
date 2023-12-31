import type { Request, Response } from 'express';
import type { NextApiRequest, NextApiResponse } from 'next';

import SessionController from '../session';
import { AuthError } from '../domain/errors';
import { jsonSafeStringify } from '../lib/safe-json';
import { AuthenticationProvider } from '../domain/authentication';


export type CredentialsProviderInit = {

  /**
   * This is the function that will be called when the user tries to authenticate.
   * 
   * @param {string} user The user|username|email that the user is trying to authenticate with. 
   * @param {string} password The password that the user is trying to authenticate with.
   * @returns {Promise<boolean>} A promise that resolves to true if the user is authenticated, and false if not. 
   */
  authenticate(user: string, password: string): Promise<boolean>;

  /**
   * An url to redirect to if the user is not authenticated.
   */
  fallbackRedirectUrl?: string;

  /**
   * If true, the user will be redirected to the fallbackRedirectUrl if the authentication fails.
   */
  redirectOnFailure?: boolean;

  /**
   * An url to redirect to if the user is authenticated.
   */
  redirectUrl?: string;
}



/**
 * This provider will authenticate the user using a username|email and password.
 * @param {CredentialsProviderInit} props The configuration for the provider. 
 */
export function Credentials(props: CredentialsProviderInit): AuthenticationProvider {
  async function handler(user: string, password: string): Promise<never> {
    if(!props.authenticate) {
      throw new AuthError('The authenticate function is required for the credentials provider.', 500, 'ERR_INTERNAL_SERVER_ERROR');
    }

    if(typeof props.authenticate !== 'function') {
      throw new AuthError('The authenticate function must be a function.', 500, 'ERR_INTERNAL_SERVER_ERROR');
    }

    try {
      const isAuthenticated = await props.authenticate(user, password);

      if(typeof isAuthenticated !== 'boolean') {
        throw new AuthError('The authenticate function must return a boolean.', 500, 'ERR_INTERNAL_SERVER_ERROR');
      }

      if(!isAuthenticated) {
        throw new AuthError('Failed to authenticate. Make sure the user and password are correct.', 401, 'ERR_UNAUTHORIZED');
      }

      const session = new SessionController(void 0 as unknown as any);
    } catch (err: any) {
      if(err instanceof AuthError) {
        throw err;
      }

      throw new AuthError(err.message, err.statusCode ?? 500, 'ERR_AUTHENTICATE_FUNCTION_THROW', { _innerCause: err });
    }
  }

  async function express(request: Request, response: Response): Promise<void> {
    try {
      if(!request.body.user) {
        throw new AuthError('The user field is required.', 400, 'ERR_MISSING_REQUIRED_FIELD');
      }

      if(!request.body.password) {
        throw new AuthError('The password field is required.', 400, 'ERR_MISSING_REQUIRED_FIELD');
      }

      const isAuthenticated = await handler(request.body.user, request.body.password);

      if(isAuthenticated) {
        if(props.redirectUrl) {
          response.redirect(props.redirectUrl);
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(200).send(jsonSafeStringify({
            message: 'Authenticated successfully.',
          }));
    
          return void response.end();
        }
      } else {
        if(props.redirectOnFailure) {
          response.redirect(props.fallbackRedirectUrl ?? '/');
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(401).send(jsonSafeStringify({
            error: {
              message: 'Failed to authenticate. Make sure the user and password are correct.',
              name: 'Unauthorized',
              type: 'ERR_UNAUTHORIZED',
            },
          }));
    
          return void response.end();
        }
      }
    } catch (err: any) {
      if(err instanceof AuthError) {
        if(props.redirectOnFailure) {
          response.redirect(props.fallbackRedirectUrl ?? '/');
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(err.statusCode).send(jsonSafeStringify({
            error: {
              message: err.message,
              name: err.name,
              type: err.type,
            },
            _inner: err,
          }));

          return void response.end();
        }
      } else {
        response.setHeader('Content-Type', 'application/json; charset=UTF-8');
        response.status(401).send(jsonSafeStringify({
          error: {
            message: err.message,
            name: 'Unauthorized',
            type: 'ERR_AUTHENTICATION_FAILED',
          },
          _inner: err,
        }));

        return void response.end();
      }
    }
  }

  async function next(request: NextApiRequest, response: NextApiResponse): Promise<void> {
    try {
      if(!request.body.user) {
        throw new AuthError('The user field is required.', 400, 'ERR_MISSING_REQUIRED_FIELD');
      }

      if(!request.body.password) {
        throw new AuthError('The password field is required.', 400, 'ERR_MISSING_REQUIRED_FIELD');
      }

      const isAuthenticated = await handler(request.body.user, request.body.password);

      if(isAuthenticated) {
        if(props.redirectUrl) {
          response.redirect(props.redirectUrl);
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(200).send(jsonSafeStringify({
            message: 'Authenticated successfully.',
          }));
    
          return void response.end();
        }
      } else {
        if(props.redirectOnFailure) {
          response.redirect(props.fallbackRedirectUrl ?? '/');
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(401).send(jsonSafeStringify({
            error: {
              message: 'Failed to authenticate. Make sure the user and password are correct.',
              name: 'Unauthorized',
              type: 'ERR_UNAUTHORIZED',
            },
          }));
    
          return void response.end();
        }
      }
    } catch (err: any) {
      if(err instanceof AuthError) {
        if(props.redirectOnFailure) {
          response.redirect(props.fallbackRedirectUrl ?? '/');
        } else {
          response.setHeader('Content-Type', 'application/json; charset=UTF-8');
          response.status(err.statusCode).send(jsonSafeStringify({
            error: {
              message: err.message,
              name: err.name,
              type: err.type,
            },
            _inner: err,
          }));

          return void response.end();
        }
      } else {
        response.setHeader('Content-Type', 'application/json; charset=UTF-8');
        response.status(401).send(jsonSafeStringify({
          error: {
            message: err.message,
            name: 'Unauthorized',
            type: 'ERR_AUTHENTICATION_FAILED',
          },
          _inner: err,
        }));

        return void response.end();
      }
    }
  }
  

  return {
    type: 'credentials',
    options: props,
    handler: handler as unknown as any,
    middlewares: {
      express,
      next,
    },
  };
}

export default Credentials;