import { Observable } from "rxjs";

export interface StoreData<K, State> {
    data: Map<K, State> | State;
}

export interface Config {
    idPath: string[]
}

export interface Store<State, K = string, M = any> {
    add(state: Partial<State>): void;
    asObservable(): Observable<StoreData<K, State>>;
    getAll(): StoreData<K, State>;
    get(id?: K): State | undefined;
    getMetadata(): M | undefined;
    remove(id?: K): void;
    reset(): void;
    setMetadata(data: M): void;
    update(state: Partial<State>): void;

}