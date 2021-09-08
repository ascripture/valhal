import { Config } from './config';
import { ManyStorable, StorableConstructor } from './storable';

export function createStore<STATE, KEY = string, META = any>(
  ctor: StorableConstructor<STATE, KEY, META>,
  config: Config
): ManyStorable<STATE, KEY, META> {
  return new ctor(config);
}
