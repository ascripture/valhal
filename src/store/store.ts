import { Observable, ReplaySubject, Subject } from 'rxjs';
import { getConfig, resettable } from '../util';
import { Config, defaultConfig } from '../config';
import { Storable } from '..';

export class Store<STATE> implements Storable<STATE> {
  private state: STATE | undefined;
  private readonly subject: Subject<STATE>;
  private readonly _reset: () => void;
  private readonly observable: Observable<STATE>;
  private cacheTimeoutId: number | undefined;

  constructor(readonly config: Config = defaultConfig) {
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
      if (process.env.NODE_ENV !== 'production') {
        console.info(`Remove state as cache timeout was triggered.`);
      }
      this.reset();
    };

    this.cacheTimeoutId = config?.cacheMS
      ? setTimeout(timerHandler, this.config.cacheMS)
      : undefined;

    this.next();
  }
}
