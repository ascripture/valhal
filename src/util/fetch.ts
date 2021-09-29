import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { getConfig, setNestedKey } from '.';
import {
  CommonEntityUI,
  CommonState,
  ManyStorable,
  ManyStorableWithUI,
} from '..';

export function fetch<
  ID = string,
  STATE = unknown,
  META extends CommonState = CommonState,
  UI extends CommonEntityUI<ID> = CommonEntityUI<ID>
>(
  id: ID,
  fetch: (id: ID) => Observable<Partial<STATE>>,
  store:
    | ManyStorable<STATE, ID, META>
    | ManyStorableWithUI<STATE, ID, UI, META>,
  options: {
    force?: boolean;
    useEntityLoading?: boolean;
    useStoreLoading?: boolean;
    mergeDeep?: boolean;
  } = {
    force: false,
    useEntityLoading: false,
    useStoreLoading: false,
    mergeDeep: false,
  }
) {
  if (store.has(id) && !options?.force) {
    return of(store.getBy(id));
  }

  if (options.useStoreLoading) {
    store.update({ isLoading: true } as Partial<META>);
  }

  if (options.useEntityLoading) {
    const storeWithUI = store as ManyStorableWithUI<STATE, ID, UI, META>;
    if (!storeWithUI.getUIStore) {
      throw new Error(
        'useEntityLoading only works with stores which implement ManyStorableWithUI'
      );
    }

    const uiStore = storeWithUI.getUIStore();
    const ui = {
      isLoading: true,
    } as Partial<UI>;

    const config = getConfig(store);
    if (!config.idPath) {
      throw new Error(
        'idPath is undefined but entity loading requires idPaths'
      );
    }

    setNestedKey(ui, config.idPath, id);

    uiStore.upsert(ui, {
      mergeDeep: !!options?.mergeDeep,
    });
  }

  const disableLoading = () => {
    if (options.useStoreLoading) {
      store.update({ isLoading: false } as Partial<META>);
    }

    if (options.useEntityLoading) {
      const storeWithUI = store as ManyStorableWithUI<STATE, ID, UI, META>;
      if (!storeWithUI.getUIStore) {
        throw new Error(
          'useEntityLoading only works with stores which implement ManyStorableWithUI'
        );
      }

      const uiStore = storeWithUI.getUIStore();
      const ui = {
        isLoading: false,
      } as Partial<UI>;

      const config = getConfig(store);
      if (!config.idPath) {
        throw new Error(
          'idPath is undefined but entity loading requires idPaths'
        );
      }

      setNestedKey(ui, config.idPath, id);

      uiStore.upsert(ui, {
        mergeDeep: !!options?.mergeDeep,
      });
    }
  };

  return fetch(id).pipe(
    tap(disableLoading, disableLoading),
    tap(result => {
      store.upsert(result, { mergeDeep: !!options?.mergeDeep });
    }),
    map(x => x as STATE)
  ) as Observable<STATE>;
}
