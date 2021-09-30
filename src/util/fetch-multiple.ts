import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  CommonEntityUI,
  CommonState,
  ManyStorable,
  ManyStorableWithUI,
} from '..';

export function fetchMultiple<
  ID = string,
  STATE = unknown,
  META extends CommonState = CommonState,
  UI extends CommonEntityUI<ID> = CommonEntityUI<ID>
>(
  fetch: () => Observable<Partial<STATE>[]>,
  store:
    | ManyStorable<STATE, ID, META>
    | ManyStorableWithUI<STATE, ID, UI, META>,
  options: {
    useStoreCache?: boolean;
    useStoreLoading?: boolean;
    mergeDeep?: boolean;
  } = {
    useStoreCache: true,
    useStoreLoading: false,
    mergeDeep: false,
  }
) {
  if (options.useStoreCache && store.cached()) {
    return of(store.getAllArray());
  }

  if (options.useStoreLoading) {
    store.update({ isLoading: true } as Partial<META>);
  }

  const disableLoading = () => {
    if (options.useStoreLoading) {
      store.update({ isLoading: false } as Partial<META>);
    }
  };

  return fetch().pipe(
    tap(disableLoading, disableLoading),
    tap(result => {
      for (const state of result) {
        store.upsert(state, { mergeDeep: !!options?.mergeDeep });
      }
    }),
    map(x => x as STATE[])
  ) as Observable<STATE[]>;
}
