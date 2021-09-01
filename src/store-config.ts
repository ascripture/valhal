import { Store } from "./store";

export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export function StoreConfig<T = any, U = any, M = any>(config: {
    cacheMS: number;
    initialState: T,
}) {
    return (store: Type<Store<T, U, M>>) => {
        class ConfiguratedStore extends store {
            constructor() {
                super(config.initialState);
                this.config["storeName"] = config.name;
                this.configKey = { idKey: "id" };

                for (let key in config) {
                    this[configKey][key] = config[key];
                }
            }
        }
        return ConfiguratedStore;
    }
}