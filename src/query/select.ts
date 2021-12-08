import { map } from 'rxjs/operators';
import { ManyStorable } from '../storable';
import { mapStoreData } from '../util';

export function select<ID, STATE>(
  id: ID,
  store: ManyStorable<STATE, ID>,
  options?: { initialValue?: STATE }
) {
  return store.asEntityObservable().pipe(
    map((store) => mapStoreData(id, store)),
    map((state) => state ?? options?.initialValue),
    // distinctUntilChanged()
  );
}
