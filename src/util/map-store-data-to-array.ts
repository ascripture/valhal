import { StorableData } from '../storable';

export function mapStoreDataToArray<ID, STATE>(
  storeData: StorableData<ID, STATE>
) {
  if (storeData?.data instanceof Map) {
    return Array.from(storeData.data?.values());
  } else if (!(storeData?.data instanceof Map)) {
    return [storeData.data];
  }

  throw new Error(`State is not iterable.`);
}
