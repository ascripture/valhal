import { Observable, ReplaySubject, Subject } from 'rxjs';
import { getConfig, mergeDeep, nestedPathValue, resettable } from '../util';
import { StorableData } from '../storable';
import { Config, defaultConfig } from '../config';
import { CommonState } from '../common-state';
import { CommonEntityUI, ManyStorable, ManyStorableWithUI } from '..';

export interface EntityStoreData<ENTITY, ID = any>
  extends StorableData<ID, ENTITY> {
  data: Map<ID, ENTITY>;
}

interface EntityConfig {
  createdAt: number;
  cacheTimeoutId?: number;
}

export class EntityStore<
  ENTITY extends object,
  ID = any,
  META = CommonState,
  UI extends object = CommonEntityUI<ID>
> implements ManyStorableWithUI<ENTITY, ID, UI, META> {
  private readonly entityMap: Map<ID, ENTITY>;
  private readonly entityConfigMap: Map<ID, EntityConfig>;
  private readonly subject: Subject<EntityStoreData<ENTITY>>;
  private readonly _reset: () => void;
  private readonly observable: Observable<EntityStoreData<ENTITY>>;

  private metadata: META | undefined;
  private readonly metaSubject: Subject<META>;
  private readonly metaReset: () => void;
  private readonly metaObservable: Observable<META>;

  private uiStore: EntityStore<UI, ID, META> | undefined;

  constructor(readonly config: Config = defaultConfig) {
    this.entityMap = new Map();
    this.entityConfigMap = new Map();
    const { observable, subject, reset } = resettable(
      () => new ReplaySubject<EntityStoreData<ENTITY>>(1)
    );

    this.subject = subject;
    this.observable = observable;
    this._reset = reset;

    const {
      observable: metaObservable,
      subject: metaSubject,
      reset: metaReset,
    } = resettable(() => new ReplaySubject<META>(1));

    this.metaSubject = metaSubject;
    this.metaObservable = metaObservable;
    this.metaReset = metaReset;
  }

  asEntityObservable() {
    return this.observable;
  }

  asObservable() {
    return this.metaObservable;
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

  getAll() {
    return {
      data: new Map(this.entityMap),
    };
  }

  getBy(id: ID) {
    return this.entityMap.get(id);
  }

  get() {
    return this.metadata;
  }

  getUIStore(): ManyStorable<UI, ID, META> {
    if (!this.uiStore) {
      const config = getConfig(this);
      this.uiStore = new EntityStore(config);
    }

    return this.uiStore;
  }

  has(id: ID) {
    return !!this.getBy(id);
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
    this.metadata = undefined;
    this._reset();
    this.metaReset();
  }

  set(data: META) {
    this.metadata = data;
    this.metaSubject.next(this.metadata);
  }

  update(state: Partial<META>) {
    if (!state) {
      throw new Error(`Meta State is undefined or null.`);
    }

    this.metadata = { ...this.metadata, ...state } as META;
    this.metaSubject.next(this.metadata);
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
      this.updateBy(state, options);
    } else {
      this.add(state);
    }
  }

  updateBy(
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
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          `Remove cached entity ${id} as cache timeout was triggered.`
        );
      }
      this.remove(id);
    };
    const timeoutId = config?.cacheMS
      ? setTimeout(timerHandler, config?.cacheMS)
      : undefined;

    this.entityConfigMap.set(id, {
      cacheTimeoutId: timeoutId,
      createdAt: Date.now(),
    });
  }
}
