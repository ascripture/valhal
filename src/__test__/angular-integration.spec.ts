import { EntityStore, StoreConfig } from '..';
import { getConfig } from '../util';

describe('AngularIntegration', () => {
  @StoreConfig({
    cacheMS: 200,
    idPath: ['test', 'id'],
  })
  class TestStore extends EntityStore<{ id: string; value: number }> {}

  it('the decorator uses given config properties', () => {
    const store = new TestStore();

    expect(getConfig(store).idPath).toEqual(['test', 'id']);
    expect(getConfig(store).cacheMS).toEqual(200);
  });

  @StoreConfig({
    cacheMS: 200,
  })
  class TestStore2 extends EntityStore<{ id: string; value: number }> {}

  it('the decorator uses default config', () => {
    const store = new TestStore2();

    expect(getConfig(store).idPath).toEqual(['id']);
    expect(getConfig(store).cacheMS).toEqual(200);
  });

  @StoreConfig({
    cacheMS: 200,
  })
  class TestStore3 extends EntityStore<{ id: string; value: number }> {
    constructor(readonly testValue: number) {
      super();
    }
  }

  it('the decorator also accepts custom values in the child constructor', () => {
    const store = new TestStore3(500);

    expect(getConfig(store).idPath).toEqual(['id']);
    expect(getConfig(store).cacheMS).toEqual(200);
    expect(store.testValue).toEqual(500);
  });
});
