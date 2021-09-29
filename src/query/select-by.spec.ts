import { EntityStore } from '../entity-store';
import { selectBy } from './select-by';

describe('selectBy', () => {
  it('selects entities by filter', done => {
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

    selectBy(state => state?.value >= 200, store).subscribe(result => {
      expect(result[0]?.id).toEqual('test2');
      expect(result[1]?.id).toEqual('test3');
      done();
    });
  });

  it('selects entities by filter and reacts to changes', done => {
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

    let expectations = ['test2', 'test3'];
    let lastRun = false;
    selectBy(state => state?.value >= 200, store).subscribe(result => {
      let i = 0;
      for (const expectation of expectations) {
        expect(result[i++]?.id).toEqual(expectation);
      }

      if (lastRun) {
        done();
      }
    });

    setTimeout(() => {
      lastRun = true;
      expectations = ['test3'];
      store.updateEntity({
        id: 'test2',
        value: 199,
      });
    }, 200);
  });
});
