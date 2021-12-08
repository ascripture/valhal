import { Observable, ReplaySubject, Subject } from 'rxjs';
import { getConfig, mergeDeep, nestedPathValue, resettable } from '../util';
import { StorableData } from '../storable';
import { Config, defaultConfig } from '../config';
import { CommonState } from '../common-state';
import { CommonEntityUI } from '../common-state';
import { ManyStorableWithUI, ManyStorable } from '../storable';
import { Store } from '../store';
import { unnamedStores } from '../stores';
import { Storable } from '../storable';
import { shareReplay, tap } from 'rxjs/operators';

export interface EntityStoreData<ENTITY, ID = any>
  extends StorableData<ID, ENTITY> {
  data: Map<ID, ENTITY>;
}

interface EntityConfig {
  createdAt: number;
  cacheTimeoutId?: number;
}

export class EntityStore<
  ENTITY,
  ID = any,
  META = CommonState,
  UI = CommonEntityUI<ID>
> implements ManyStorableWithUI<ENTITY, ID, UI, META>
{
  private readonly entityMap: Map<ID, ENTITY>;
  private readonly entityConfigMap: Map<ID, EntityConfig>;
  private readonly subject: Subject<EntityStoreData<ENTITY>>;
  private readonly _reset: () => void;
  private readonly observable: Observable<EntityStoreData<ENTITY>>;

  private metaStore: Store<META>;
  private uiStore: EntityStore<UI, ID, META> | undefined;

  constructor(readonly config: Config = defaultConfig) {
    this.entityMap = new Map();
    this.entityConfigMap = new Map();
    const { observable, subject, reset } = resettable(
      () => new ReplaySubject<EntityStoreData<ENTITY>>(1)
    );

    this.subject = subject;
    this.observable = observable.pipe(
      shareReplay(1),
      tap((state) => {
        if (getConfig(this).logState) {
          const name = this.constructor.name;
          console.info(`${name} State: ${JSON.stringify(state.data.values())}`);
        }
      })
    );
    this._reset = reset;

    this.metaStore = new Store(getConfig(this));

    unnamedStores.push(new WeakRef<Storable<META>>(this));

    this.next();
  }

  asEntityObservable() {
    return this.observable;
  }

  asObservable() {
    return this.metaStore.asObservable();
  }

  add(state: Partial<ENTITY>) {
    const id = this.getId(state);

    if (this.entityMap.has(id)) {
      throw new Error('Entity already exists.');
    }

    const entity = { ...state } as ENTITY;
    this.setEntity(id, entity);

    this.next();
  }

  cached() {
    return this.metaStore.cached() || this.entityConfigMap.size > 0;
  }

  getAll() {
    return {
      data: new Map(this.entityMap),
    };
  }

  getAllArray() {
    return Array.from(this.getAll()?.data.values());
  }

  getEntity(id: ID) {
    return this.entityMap.get(id);
  }

  get() {
    return this.metaStore.get();
  }

  getUIStore(): ManyStorable<UI, ID, META> {
    if (!this.uiStore) {
      const config = getConfig(this);
      this.uiStore = new EntityStore(config);
    }

    return this.uiStore;
  }

  has(id: ID) {
    return !!this.getEntity(id);
  }

  remove(id: ID) {
    if (!this.entityMap.has(id)) {
      throw new Error('Entity does not exist.');
    }

    this.entityMap.delete(id);

    if (this.entityConfigMap.has(id)) {
      clearTimeout(this.entityConfigMap.get(id)?.cacheTimeoutId);
    }

    this.entityConfigMap.delete(id);

    this.next();
  }

  reset() {
    for (const config of Array.from(this.entityConfigMap.values())) {
      if (config.cacheTimeoutId) {
        clearTimeout(config.cacheTimeoutId);
      }
    }

    this.entityMap.clear();
    this.entityConfigMap.clear();
    this._reset();
    this.metaStore.reset();

    this.next();
  }

  set(data: META) {
    this.metaStore.set(data);
  }

  update(state: Partial<META>) {
    if (!state) {
      throw new Error(`Meta State is undefined or null.`);
    }

    this.metaStore.update(state);
  }

  upsert(
    state: Partial<ENTITY>,
    options: {
      mergeDeep: boolean;
    } = {
      mergeDeep: false,
    }
  ) {
    if (!state) {
      throw new Error(`Entity is undefined or null.`);
    }

    const id = this.getId(state);

    if (this.has(id)) {
      this.updateEntity(state, options);
    } else {
      this.add(state);
    }
  }

  updateEntity(
    state: Partial<ENTITY>,
    options: {
      mergeDeep: boolean;
    } = {
      mergeDeep: false,
    }
  ) {
    if (!state) {
      throw new Error(`Entity is undefined or null.`);
    }

    const id = this.getId(state);

    if (!this.entityMap.has(id)) {
      throw new Error('Entity does not exist.');
    }

    const current = this.entityMap.get(id);
    let entity = { ...current, ...state } as ENTITY;

    if (options.mergeDeep) {
      entity = mergeDeep(
        {} as ENTITY,
        current as Partial<ENTITY>,
        state
      ) as ENTITY;
    }

    this.setEntity(id, entity);
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

  private setEntity(id: ID, entity: ENTITY) {
    this.entityMap.set(id, entity);

    const config = getConfig(this);
    const timerHandler: TimerHandler = () => {
      this.remove(id);
    };

    const existingEntityConfigMap = this.entityConfigMap.get(id);
    if (existingEntityConfigMap?.cacheTimeoutId) {
      clearTimeout(existingEntityConfigMap.cacheTimeoutId);
    }

    const timeoutId = config?.cacheMS
      ? setTimeout(timerHandler, config?.cacheMS)
      : undefined;

    this.entityConfigMap.set(id, {
      cacheTimeoutId: timeoutId,
      createdAt: Date.now(),
    });
  }
}
