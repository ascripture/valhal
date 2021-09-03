import { Observable } from 'rxjs';
import { Config } from './config';

export interface StoreData<KEY, STATE> {
  data: Map<KEY, STATE> | STATE;
}

export interface StoreConstructor<STATE, KEY = string, META = any> {
  new (config: Config): Store<STATE, KEY, META>;
}

export interface Store<STATE, KEY = string, META = any> {
  add(state: Partial<STATE>): void;
  asObservable(): Observable<StoreData<KEY, STATE>>;
  getAll(): StoreData<KEY, STATE>;
  get(id?: KEY): STATE | undefined;
  getMetadata(): META | undefined;
  remove(id?: KEY): void;
  reset(): void;
  setMetadata(data: META): void;
  update(state: Partial<STATE>): void;
}
