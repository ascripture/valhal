import { EntityStore, Store, StoreConfig } from '.';
import { getConfig } from './util';

describe('StoreConfig on EntityStore', () => {
  @StoreConfig({
    cacheMS: 5000,
    idPath: ['testId'],
  })
  class TestStore extends EntityStore<{
    testId: string;
    value: number;
  }> {}

  it('uses the correct cache millisecond', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.cacheMS).toEqual(5000);
  });

  it('uses the correct id path', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.idPath).toEqual(['testId']);
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
    cacheMS: 7000,
    idPath: ['testId2'],
  })
  class TestStore extends Store<{
    testId2: string;
    value: number;
  }> {}

  it('uses the correct cache millisecond', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.cacheMS).toEqual(7000);
  });

  it('uses the correct id path', () => {
    const test = new TestStore();

    const config = getConfig(test);

    expect(config.idPath).toEqual(['testId2']);
  });
});
