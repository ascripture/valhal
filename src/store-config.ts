import { Config, defaultConfig } from './config';

export const PRESET_CONFIG = 'PRESET_CONFIG';

export function StoreConfig(config: Partial<Config>) {
  return function (constructor: any) {
    constructor[PRESET_CONFIG] = { ...defaultConfig };

    for (let i = 0, keys = Object.keys(config); i < keys.length; i++) {
      const key = keys[i];
      constructor[PRESET_CONFIG][key] = (config as any)[key];
    }
  };
}
