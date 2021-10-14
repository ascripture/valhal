import { Observable, ReplaySubject, Subject } from 'rxjs';
import { getConfig, resettable } from '../util';
import { Config, defaultConfig } from '../config';
import { Storable } from '..';
import { unnamedStores } from '../stores';
import { shareReplay } from 'rxjs/operators';

export class Store<STATE> implements Storable<STATE> {
  private state: STATE | undefined;
  private readonly subject: Subject<STATE | undefined>;
  private readonly _reset: () => void;
  private readonly observable: Observable<STATE | undefined>;
  private cacheTimeoutId: number | undefined;

  constructor(readonly config: Config = defaultConfig) {
    const { observable, subject, reset } = resettable(
      () => new ReplaySubject<STATE | undefined>(1)
    );
    this.subject = subject;
    this.observable = observable.pipe(shareReplay(1));
    this._reset = reset;

    unnamedStores.push(new WeakRef<Storable<STATE>>(this));

    this.next();
  }

  asObservable() {
    return this.observable as Observable<STATE>;
  }

  cached() {
    return !!this.get();
  }

  set(state: STATE) {
    this.setState(state);
  }

  get() {
    return this.state;
  }

  reset() {
    if (this.cacheTimeoutId) {
      clearTimeout(this.cacheTimeoutId);
      this.cacheTimeoutId = undefined;
    }

    this.state = undefined;

    this._reset();
    this.next();
  }

  update(state: Partial<STATE>) {
    if (!state) {
      throw new Error(`State is undefined or null.`);
    }

    this.setState({ ...this.state, ...state } as STATE);
  }

  private next() {
    this.subject.next(this.state);
  }

  private setState(state: STATE) {
    const config = getConfig(this);
    this.state = { ...state };

    const timerHandler: TimerHandler = () => {
      this.reset();
    };

    if (this.cacheTimeoutId) {
      clearTimeout(this.cacheTimeoutId);
    }

    this.cacheTimeoutId = config?.cacheMS
      ? setTimeout(timerHandler, this.config.cacheMS)
      : undefined;

    this.next();
  }
}
