import { Observable } from 'rxjs';
import { CommonEntityUI } from '.';
import { CommonState } from './common-state';
import { Config } from './config';

export interface StorableData<KEY, STATE> {
  data: Map<KEY, STATE> | STATE;
}

export interface StorableConstructor<STATE, KEY = string, META = any> {
  new (config: Config): ManyStorable<STATE, KEY, META>;
}

export interface Storable<STATE = CommonState> {
  config: Config;
  asObservable(): Observable<STATE>;
  cached(): boolean;
  get(): STATE | undefined;
  set(state: STATE): void;
  update(state: Partial<STATE>): void;
  reset(): void;
}

export interface ManyStorable<STATE, KEY = string, META = CommonState>
  extends Storable<META> {
  add(state: Partial<STATE>): void;
  asEntityObservable(): Observable<StorableData<KEY, STATE>>;
  getAll(): StorableData<KEY, STATE>;
  getAllArray(): STATE[];
  getEntity(id?: KEY): STATE | undefined;
  has(id: KEY): boolean;
  updateEntity(
    state: Partial<STATE>,
    options?: {
      mergeDeep: boolean;
    }
  ): void;
  upsert(
    state: Partial<STATE>,
    options?: {
      mergeDeep: boolean;
    }
  ): void;
  remove(id?: KEY): void;
}

export interface ManyStorableWithUI<
  STATE,
  KEY = string,
  UI = CommonEntityUI<KEY>,
  META = CommonState
> extends ManyStorable<STATE, KEY, META> {
  getUIStore(): ManyStorable<UI, KEY, META>;
}
