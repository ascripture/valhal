import { Storable } from '..';
import { Config } from '../config';
import { PRESET_CONFIG } from '../store-config';

export function getConfig<T>(store: Storable<T>) {
  const presetConfig = (store.constructor as any)[PRESET_CONFIG] as Config;
  return presetConfig || (store as any).config;
}
