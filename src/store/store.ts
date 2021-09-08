import { Observable, ReplaySubject, Subject } from 'rxjs';
import { resettable } from '../util';
import { Config, defaultConfig } from '../config';
import { Storable } from '..';

export class Store<STATE> implements Storable<STATE> {
  private state: STATE | undefined;
  private readonly subject: Subject<STATE>;
  private readonly _reset: () => void;
  private readonly observable: Observable<STATE>;

  constructor(protected readonly config: Config = defaultConfig) {
    const { observable, subject, reset } = resettable(
      () => new ReplaySubject<STATE>(1)
    );
    this.subject = subject;
    this.observable = observable;
    this._reset = reset;
  }

  asObservable() {
    return this.observable;
  }

  set(state: STATE) {
    this.state = { ...state };
    this.next();
  }

  get() {
    return this.state;
  }

  reset() {
    this.state = undefined;
    this._reset();
    this.next();
  }

  update(state: Partial<STATE>) {
    if (!state) {
      throw new Error(`State is undefined or null.`);
    }

    this.state = { ...this.state, ...state } as STATE;
    this.next();
  }

  private next() {
    this.subject.next(this.state);
  }
}
