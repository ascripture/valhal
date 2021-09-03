import { Config } from '../config';
import { Store } from '../store';
import { PRESET_CONFIG } from '../store-config';

export function getConfig<T, K, M>(store: Store<T, K, M>) {
  const presetConfig = (store.constructor as any)[PRESET_CONFIG] as Config;
  return presetConfig || (store as any).config;
}
