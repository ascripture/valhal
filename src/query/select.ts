import { distinctUntilChanged, map } from 'rxjs/operators';
import { ManyStorable } from '../storable';
import { mapStoreData } from '../util';

export function select<ID, STATE>(id: ID, store: ManyStorable<STATE, ID>) {
  return store.asEntityObservable().pipe(
    map(store => mapStoreData(id, store)),
    distinctUntilChanged()
  );
}
