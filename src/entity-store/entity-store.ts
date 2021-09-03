import { Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { getConfig, nestedPathValue, resettable } from '../util';
import { Store, StoreData } from '../store';
import { Config, defaultConfig } from '../config';

export interface EntityStoreData<ENTITY, ID = any>
  extends StoreData<ID, ENTITY> {
  data: Map<ID, ENTITY>;
}

export class EntityStore<ENTITY, ID = any, META = any>
  implements Store<ENTITY, ID, META> {
  private readonly entityMap: Map<ID, ENTITY>;
  private readonly subject: Subject<EntityStoreData<ENTITY>>;
  private readonly _reset: () => void;
  private readonly observable: Observable<EntityStoreData<ENTITY>>;
  private metadata: META | undefined;

  constructor(protected readonly config: Config = defaultConfig) {
    this.entityMap = new Map<ID, ENTITY>();
    const { observable, subject, reset } = resettable(
      () => new ReplaySubject<EntityStoreData<ENTITY>>(1)
    );
    this.subject = subject;
    this.observable = observable;
    this._reset = reset;
  }

  asObservable() {
    return this.observable;
  }

  selectEntity(id: ID) {
    return this.asObservable().pipe(
      map(store => store?.data?.get(id)),
      distinctUntilChanged()
    );
  }

  add(state: Partial<ENTITY>) {
    const id = this.getId(state);

    if (this.entityMap.has(id)) {
      throw new Error('Entity already exists.');
    }

    const entity = { ...state } as ENTITY;
    this.entityMap.set(id, entity);
    this.next();
  }

  getAll() {
    return {
      data: new Map(this.entityMap),
    };
  }

  get(id: ID) {
    return this.entityMap.get(id);
  }

  getMetadata() {
    return this.metadata;
  }

  remove(id: ID) {
    if (!this.entityMap.has(id)) {
      throw new Error('Entity does not exist.');
    }

    this.entityMap.delete(id);

    this.next();
  }

  reset() {
    this._reset();
  }

  setMetadata(data: META) {
    this.metadata = data;
  }

  update(state: Partial<ENTITY>) {
    if (!state) {
      throw new Error(`Entity is undefined or null.`);
    }

    const id = this.getId(state);

    if (!this.entityMap.has(id)) {
      throw new Error('Entity does not exist.');
    }

    const current = this.entityMap.get(id);
    const entity = { ...current, ...state } as ENTITY;

    this.entityMap.set(id, entity);
    this.next();
  }

  private getId(entity: Partial<ENTITY> | undefined): ID {
    const config = getConfig(this);
    if (!config.idPath) {
      throw new Error(`Config idPath is not defined`);
    }

    const id = nestedPathValue<ID>(entity, config.idPath.values());

    if (!id) {
      throw new Error(`Entity doesnt have an id.`);
    }

    return id;
  }

  private next() {
    this.subject.next({
      data: new Map(this.entityMap),
    });
  }
}
