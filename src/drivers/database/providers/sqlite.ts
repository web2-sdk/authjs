import { DatabaseRepository } from '../../../domain/database';


export class Sqlite implements DatabaseRepository {
  public get type(): 'sql' {
    return 'sql' as const;
  }
}

export default Sqlite;