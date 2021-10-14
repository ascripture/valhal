import { EntityStore, Store, StoreConfig } from '.';
import { getConfig } from './util';

describe('StoreConfig on EntityStore', () => {
  @StoreConfig({
    cacheMS: 1500,
    idPath: ['testId'],
  })
  class TestStore extends EntityStore<{
    testId: string;
    value: number;
  }> {}

  it('uses the correct cache millisecond', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.cacheMS).toEqual(1500);
  });

  it('uses the correct id path', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.idPath).toEqual(['testId']);
  });

  it('timeout works as expected with store config', (done) => {
    const store = new TestStore();

    store.add({
      testId: 'x',
      value: 100,
    });

    setTimeout(() => {
      expect(store.getEntity('x')?.value).toEqual(100);
    }, 500);

    setTimeout(() => {
      expect(store.getEntity('x')?.value).toEqual(100);
    }, 1000);

    setTimeout(() => {
      expect(store.getEntity('x')?.value).toBeUndefined();
      done();
    }, 1600);
  });
});

describe('Default StoreConfig on EntityStore', () => {
  @StoreConfig({})
  class TestStore extends EntityStore<{
    testId: string;
    value: number;
  }> {}

  it('uses the correct cache millisecond', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.cacheMS).toBeUndefined();
  });

  it('uses the correct id path', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.idPath).toEqual(['id']);
  });
});

describe('StoreConfig on Store', () => {
  @StoreConfig({
    cacheMS: 1500,
    idPath: ['testId2'],
  })
  class TestStore extends Store<{
    testId2: string;
    value: number;
  }> {}

  it('uses the correct cache millisecond', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.cacheMS).toEqual(1500);
  });

  it('uses the correct id path', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.idPath).toEqual(['testId2']);
  });

  it('timeout works as expected with store config', (done) => {
    const store = new TestStore();

    store.set({
      testId2: 'x',
      value: 100,
    });

    setTimeout(() => {
      expect(store.get()?.value).toEqual(100);
    }, 500);

    setTimeout(() => {
      expect(store.get()?.value).toEqual(100);
    }, 1000);

    setTimeout(() => {
      expect(store.get()?.value).toBeUndefined();
      done();
    }, 1600);
  });
});
