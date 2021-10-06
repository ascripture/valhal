import { Storable } from './storable';
import { unnamedStores } from './stores';

export function resetStores() {
  const existingStores: WeakRef<Storable<unknown>>[] = [];

  for (const storeRef of unnamedStores) {
    const store = storeRef.deref();
    if (store) {
      store.reset();
      existingStores.push(storeRef);
    }
  }

  unnamedStores.splice(0, unnamedStores.length);
  unnamedStores.push(...existingStores);
}
