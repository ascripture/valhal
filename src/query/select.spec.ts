import { EntityStore } from '../entity-store';
import { select } from './select';

describe('select', () => {
  it('selects an entity', done => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>();

    store.add({
      id: 'test',
      value: 100,
    });

    store.add({
      id: 'test2',
      value: 200,
    });

    store.add({
      id: 'test3',
      value: 300,
    });

    select('test2', store).subscribe(result => {
      expect(result?.value).toEqual(200);
      done();
    });
  });

  it('selects an entity and reacts to changes', done => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>();

    store.add({
      id: 'test',
      value: 100,
    });

    store.add({
      id: 'test2',
      value: 200,
    });

    store.add({
      id: 'test3',
      value: 300,
    });

    let expectation = 200;
    let lastRun = false;
    select('test2', store).subscribe(result => {
      expect(result?.value).toEqual(expectation);

      if (lastRun) {
        done();
      }
    });

    setTimeout(() => {
      lastRun = true;
      expectation = 900;
      store.updateEntity({
        id: 'test2',
        value: 900,
      });
    }, 200);
  });
});
