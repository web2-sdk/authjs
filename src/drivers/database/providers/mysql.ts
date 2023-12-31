import { DatabaseRepository } from '../../../domain/database';


export class MySQL implements DatabaseRepository {
  public get type(): 'sql' {
    return 'sql' as const;
  }
}

export default MySQL;