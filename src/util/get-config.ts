import { Config } from '../config';
import { ManyStorable } from '../storable';
import { PRESET_CONFIG } from '../store-config';

export function getConfig<T, K, M>(store: ManyStorable<T, K, M>) {
  const presetConfig = (store.constructor as any)[PRESET_CONFIG] as Config;
  return presetConfig || (store as any).config;
}
