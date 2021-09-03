import { distinctUntilChanged, map } from 'rxjs/operators';
import { Store } from '../store';
import { mapStoreDataToArray } from '../util';

export function selectBy<ID, STATE>(
  by: (state: STATE, index?: number, all?: STATE[]) => boolean,
  store: Store<STATE, ID>
) {
  return store.asObservable().pipe(
    map(store => mapStoreDataToArray(store)),
    map(store => store.filter(by)),
    distinctUntilChanged()
  );
}
