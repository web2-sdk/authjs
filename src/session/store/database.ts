import { SessionStore } from '../../domain/session';
import { DatabaseDriver } from '../../domain/database';


export class DatabaseSessionStore implements SessionStore {
  constructor(private readonly _driver: DatabaseDriver) {}
}

export default DatabaseSessionStore;