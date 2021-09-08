import { distinctUntilChanged, map } from 'rxjs/operators';
import { ManyStorable } from '../storable';
import { mapStoreDataToArray } from '../util';

export function selectBy<ID, STATE, META = any>(
  by: (state: STATE, index?: number, all?: STATE[]) => boolean,
  store: ManyStorable<STATE, ID, META>
) {
  return store.asEntityObservable().pipe(
    map(store => mapStoreDataToArray(store)),
    map(store => store.filter(by)),
    distinctUntilChanged()
  );
}
