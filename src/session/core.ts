import type { Dict } from '../types';
import { Entity } from '../domain/Entity';
import { SessionStore } from '../domain/session';



type SessionProps<T> = {
  payload: T;
  headers?: Dict<string>;
  expires: number | Date | `${number}${string}`;
}


class Session<T> extends Entity<SessionProps<T>> {
  public get payload(): T {
    return this.props.payload;
  }

  private constructor(props: SessionProps<T>, id?: string) {
    super(props, id);
  }
}


export class SessionController {
  readonly #s: SessionStore;

  constructor(storage: SessionStore) {
    this.#s = storage;
  }
}