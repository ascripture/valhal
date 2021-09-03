import { distinctUntilChanged, map } from 'rxjs/operators';
import { Store } from '../store';
import { mapStoreData } from '../util';

export function select<ID, STATE>(id: ID, store: Store<STATE, ID>) {
  return store.asObservable().pipe(
    map(store => mapStoreData(id, store)),
    distinctUntilChanged()
  );
}
