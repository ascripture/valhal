import { EntityStore, resetStores, Store } from ".";

describe('resetStores', () => {
    it('calls reset for all store references', () => {
        const store = new Store();
        store.set({
            test: 1
        });

        const entityStore = new EntityStore();
        entityStore.add({
            id: 'test',
            value: 1
        });

        entityStore.set({
            isLoading: true
        });

        const spyStore = jest.spyOn(store, 'reset');
        const spyEntityStore = jest.spyOn(entityStore, 'reset');

        resetStores();

        expect(spyStore).toHaveBeenCalled();
        expect(spyEntityStore).toHaveBeenCalled();

        const storeData = store.get();
        expect(storeData).toBeUndefined();

        const entityStoreData = entityStore.getEntity('test');
        expect(entityStoreData).toBeUndefined();

        const entityStoreMeta = entityStore.get();
        expect(entityStoreMeta).toBeUndefined();

        const entityStoreAll = entityStore.getAllArray();
        expect(entityStoreAll).toEqual([]);
    });
});