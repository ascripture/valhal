import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Storable } from '../storable';
import { CommonState } from '../common-state';

export function simpleFetch<STATE extends CommonState = CommonState>(
  fetch: () => Observable<Partial<STATE>>,
  store: Storable<STATE>,
  options: {
    force?: boolean;
    useStoreLoading?: boolean;
  } = {
    force: false,
    useStoreLoading: false,
  }
) {
  if (store.cached() && !options?.force) {
    return of(store.get());
  }

  if (options.useStoreLoading) {
    store.update({ isLoading: true } as Partial<STATE>);
  }

  const disableLoading = () => {
    if (options.useStoreLoading) {
      store.update({ isLoading: false } as Partial<STATE>);
    }
  };

  return fetch().pipe(
    tap(disableLoading, disableLoading),
    tap((result) => {
      if (result) {
        store.update(result);
      }
    }),
    map((x) => x as STATE)
  ) as Observable<STATE>;
}
