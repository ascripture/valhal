import { Config } from './config';
import { Store, StoreConstructor } from './store';

export function createStore<STATE, KEY = string, META = any>(
  ctor: StoreConstructor<STATE, KEY, META>,
  config: Config
): Store<STATE, KEY, META> {
  return new ctor(config);
}
