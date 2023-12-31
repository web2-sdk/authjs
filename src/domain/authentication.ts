import type {
  Dict,
  ProviderType,
  NextRequestHandler,
  ExpressRequestHandler,
} from '../types';


export interface AuthenticationProvider {
  readonly type: ProviderType;
  readonly options: Dict<any>;
  handler(...args: unknown[]): Promise<void>;

  readonly middlewares: {
    express: ExpressRequestHandler;
    next: NextRequestHandler;
  }
}