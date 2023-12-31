import { type PoolConfig, type PoolClient, Pool, type QueryResult, type QueryResultRow } from 'pg';

import asyncRetry from '../../../lib/async-retry';
import { Exception } from '../../../domain/errors';
import { isPlainObject, isProduction } from '../../../utils';
import { DatabaseRepository } from '../../../domain/database';


type DBCache = {
  pool: Pool | null;
  maxConnections: number | null;
  openedConnections: number | null;
  reservedConnections: number | null;
  openedConnectionsLastUpdate: number | null;
}

export type QueryOptions = {

  /**
   * The values to use for the query.
   */
  values?: any[];

  /**
   * The transaction to use for the query.
   */
  readonly transaction?: PoolClient;
}

type PostgresConnectionProps = {
  readonly uri: string;
  readonly username: string;
  readonly password: string;
  readonly host: string;
  readonly port: number;
  readonly datname: string;
}

export class Postgres implements DatabaseRepository {
  readonly #c: PostgresConnectionProps;
  #config: PoolConfig;
  #cache: DBCache;

  constructor(uri: string);
  constructor(options: Omit<PostgresConnectionProps, 'uri'>);
  constructor(uriOrOptions: string | Omit<PostgresConnectionProps, 'uri'>) {
    if(typeof uriOrOptions === 'string') {
      const u = new URL(uriOrOptions);

      this.#c = Object.freeze({
        uri: uriOrOptions,
        datname: u.pathname.replace('/', ''),
        host: u.hostname,
        password: u.password,
        port: parseInt(u.port, 10),
        username: u.username,
      });
    } else if(isPlainObject(uriOrOptions)) {
      const u = new URL('postgres://');
      u.hostname = uriOrOptions.host;
      u.port = uriOrOptions.port.toString();
      u.username = uriOrOptions.username;
      u.password = uriOrOptions.password;
      u.pathname = `/${uriOrOptions.datname}`;

      this.#c = Object.freeze({
        uri: u.toString(),
        datname: uriOrOptions.datname,
        host: uriOrOptions.host,
        password: uriOrOptions.password,
        port: uriOrOptions.port,
        username: uriOrOptions.username,
      });
    } else {
      throw new Exception('Invalid connection options');
    }

    this.#config = {
      connectionTimeoutMillis: 2000,
      idleTimeoutMillis: 30000,
      connectionString: this.#c.uri,
      max: 1,
      ssl: {
        rejectUnauthorized: false,
      },
      allowExitOnIdle: true,
    };

    if(!isProduction || process.env.SSL_MODE !== 'require') {
      delete this.#config.ssl;
    }

    this.#cache = {
      pool: null,
      maxConnections: null,
      reservedConnections: null,
      openedConnections: null,
      openedConnectionsLastUpdate: null,
    };
  }

  /**
   *  Return the type of the database driver as one of 'sql' or 'non-sql'.
   */
  public get type(): 'sql' {
    return 'sql' as const;
  }

  /**
   * Return the name of the database driver.
   */
  public get name(): 'PostgreSQL' {
    return 'PostgreSQL' as const;
  }

  public get connection(): PostgresConnectionProps {
    return Object.freeze({ ...this.#c });
  }

  async #checkForTooManyConnections(client: PoolClient): Promise<boolean> {
    const currentTime = new Date().getTime();
    const openedConnectionsMaxAge = 5000;
    const maxConnectionsTolerance = 0.8;
    const datname = this.#c.datname;

    if(this.#cache.maxConnections === null || this.#cache.reservedConnections === null) {
      const [maxConnections, reservedConnections] = await getConnectionLimits();
      this.#cache.maxConnections = maxConnections;
      this.#cache.reservedConnections = reservedConnections;
    }

    if(this.#cache.openedConnections === null || currentTime - this.#cache.openedConnectionsLastUpdate! > openedConnectionsMaxAge) {
      const openedConnections = await getOpenedConnections();
      this.#cache.openedConnections = openedConnections;
      this.#cache.openedConnectionsLastUpdate = currentTime;
    }

    if(this.#cache.openedConnections! > (this.#cache.maxConnections! - this.#cache.reservedConnections!) * maxConnectionsTolerance) return true;

    return false;

    async function getConnectionLimits() {
      const [maxConnectionsResult, reservedConnectionResult] = await client.query(
        'SHOW max_connections; SHOW superuser_reserved_connections;',
      ) as any;
        
      return [
        maxConnectionsResult.rows[0].max_connections,
        reservedConnectionResult.rows[0].superuser_reserved_connections,
      ];
    }

    async function getOpenedConnections() {
      const openConnectionsResult = await client.query({
        text: 'SELECT numbackends as opened_connections FROM pg_stat_database where datname = $1',
        values: [datname],
      });
      return openConnectionsResult.rows[0].opened_connections;
    }
  }

  async #exec<T extends QueryResultRow>(query: string, options?: QueryOptions): Promise<QueryResult<T>> {
    let client: PoolClient | null = null;

    try {
      client = options?.transaction ? options!.transaction : await this.#tryToGetNewClientFromPool();
      const response = await client!.query(query, options?.values);
      return response;
    } catch (err: any) {
      throw new Exception(err.message ?? err, { status: err.code || 500});
    } finally {
      if(client && !options?.transaction) {
        const tooManyConnections = await this.#checkForTooManyConnections(client);
        client.release();

        if(tooManyConnections) {
          await this.#cache.pool?.end();
          this.#cache.pool = null;
        }
      }
    }
  }

  async #tryToGetNewClientFromPool() {
    const newClientFromPool = async (): Promise<PoolClient> => {
      if(!this.#cache.pool) {
        this.#cache.pool = new Pool(this.#config);
      }
  
      return await this.#cache.pool.connect();
    };

    const clientFromPool = await asyncRetry<PoolClient>(newClientFromPool, {
      retries: 2,
      minTimeout: 150,
      maxTimeout: 5000,
      factor: 2,
    });
  
    return clientFromPool;
  }

  async #isOnline(): Promise<boolean> {
    try {
      await this.#exec('SELECT numbackends FROM pg_stat_database where datname = $1', {
        values: [this.#c.datname],
      });
  
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async #getOpenedConnections(): Promise<number> {
    const openConnectionsResult = await this.#exec(
      'SELECT numbackends as opened_connections FROM pg_stat_database where datname = $1',
      { values: [this.#c.datname] },
    );
    
    return openConnectionsResult.rows[0].opened_connections;
  }

  /**
   * Get the number of opened connections.
   * @returns A promise that resolves to the number of opened connections.
   */
  public getOpenedConnections(): Promise<number> {
    return this.#getOpenedConnections();
  }

  /**
   * Check if the database is online.
   * @returns A promise that resolves to a boolean indicating if the database is online.
   */
  public isOnline(): Promise<boolean> {
    return this.#isOnline();
  }

  /**
   * Run a database query.
   * @param query - The SQL query to run.
   * @param options - Additional options for the query.
   * @returns A promise that resolves to the query result.
   */
  public query<T extends QueryResultRow>(query: string, options?: QueryOptions): Promise<QueryResult<T>> {
    return this.#exec(query, options);
  }

  /**
   * Run a transaction.
   * @param callback - The callback function to execute within the transaction.
   * @returns A promise that resolves to the result of the transaction.
   */
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.#tryToGetNewClientFromPool();
    await client.query('BEGIN');
    let result: T;

    try {
      result = await callback(client);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return result;
  }

  /**
   * Close the database connection pool.
   * @returns A promise that resolves when the connection pool is closed.
   */
  public async close(): Promise<void> {
    await this.#cache.pool?.end();
    this.#cache.pool = null;
  }
}

export default Postgres;