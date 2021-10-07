import { map } from 'rxjs/operators';
import { ManyStorable } from '../storable';
import { mapStoreDataToArray } from '../util';

export function selectAll<STATE, ID = any, META = any>(
  store: ManyStorable<STATE, ID, META>
) {
  return store
    .asEntityObservable()
    .pipe(map((store) => mapStoreDataToArray(store)));
}
