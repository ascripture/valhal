import { Observable } from 'rxjs';
import { Config } from './config';

export interface StorableData<KEY, STATE> {
  data: Map<KEY, STATE> | STATE;
}

export interface StorableConstructor<STATE, KEY = string, META = any> {
  new (config: Config): ManyStorable<STATE, KEY, META>;
}

export interface Storable<STATE> {
  asObservable(): Observable<STATE>;
  get(): STATE | undefined;
  set(state: STATE): void;
  update(state: Partial<STATE>): void;
  reset(): void;
}

export interface ManyStorable<STATE, KEY = string, META = void> extends Storable<META> {
  add(state: Partial<STATE>): void;
  asEntityObservable(): Observable<StorableData<KEY, STATE>>;
  getAll(): StorableData<KEY, STATE>;
  getBy(id?: KEY): STATE | undefined;
  updateBy(state: Partial<STATE>): void;
  remove(id?: KEY): void;
}
