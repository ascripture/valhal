import { StoreData } from '../store';

export function mapStoreData<ID, STATE>(
  id: ID | undefined,
  storeData: StoreData<ID, STATE>
) {
  if (id && storeData?.data instanceof Map) {
    return storeData.data?.get(id);
  } else if (!(storeData?.data instanceof Map)) {
    return storeData.data;
  }

  throw new Error(`id is undefined`);
}
