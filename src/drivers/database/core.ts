import { Exception } from '../../domain/errors';
import { DatabaseDriver, DatabaseRepository } from '../../domain/database';


export class Database implements DatabaseDriver {
  readonly #repository: DatabaseRepository;

  constructor(db: DatabaseRepository) {
    this.#repository = db;
  }

  public exec(query: string, params?: unknown[]): Promise<any> {
    if(this.#repository.type !== 'sql') {
      throw new Exception(`You can only execute SQL queries on SQL databases. This database is [${this.#repository.type}] ${this.#repository.name}`);
    }

    return this.#repository.runQuery!(query, { values: params });
  }

  public close() {
    return this.#repository.close();
  }
}

export default Database;