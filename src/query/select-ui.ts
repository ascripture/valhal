import { distinctUntilChanged, map } from 'rxjs/operators';
import { ManyStorableWithUI } from '../storable';
import { mapStoreData } from '../util';

export function selectUI<ID, UI, STATE = any>(
  id: ID,
  store: ManyStorableWithUI<STATE, ID, UI>,
  options?: { initialValue?: UI }
) {
  return store
    .getUIStore()
    .asEntityObservable()
    .pipe(
      map((store) => mapStoreData(id, store)),
      map((state) => state ?? options?.initialValue),
      distinctUntilChanged()
    );
}
