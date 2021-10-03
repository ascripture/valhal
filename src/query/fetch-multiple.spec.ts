import { Observable, of } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { fetchMultiple } from '.';
import { EntityStore } from '../entity-store';

describe('fetchMultiple', () => {
  it('saved entities in the store', done => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      idPath: ['id'],
    });

    fetchMultiple(
      () =>
        of([
          { id: 'x1', value: 500 },
          { id: 'x2', value: 600 },
        ]),
      store
    ).subscribe(result => {
      expect(result[0]).toEqual({
        id: 'x1',
        value: 500,
      });

      expect(result[1]).toEqual({
        id: 'x2',
        value: 600,
      });

      expect(store.getEntity('x1')).toEqual({
        id: 'x1',
        value: 500,
      });

      expect(store.getEntity('x2')).toEqual({
        id: 'x2',
        value: 600,
      });

      done();
    });
  });

  it('used the store cache', done => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      cacheMS: 5000,
      idPath: ['id'],
    });

    store.add({
      id: 'x1',
      value: 250,
    });

    fetchMultiple(() => of([{ id: 'x1', value: 500 }]), store, {
      useStoreCache: true,
    }).subscribe(result => {
      expect(result[0]).toEqual({
        id: 'x1',
        value: 250,
      });

      const stored = store.getEntity('x1');
      expect(stored).toEqual({
        id: 'x1',
        value: 250,
      });

      store.reset();
      done();
    });
  });

  it('saved entity in the store with store loading', done => {
    type STATE = {
      id: string;
      value: number;
    };

    const store = new EntityStore<STATE>({
      cacheMS: 500,
      idPath: ['id'],
    });

    expect(store.get()?.isLoading).toBeFalsy();

    fetchMultiple(
      () => {
        return of<Partial<STATE>[]>([{ id: 'x1', value: 500 }]).pipe(
          debounceTime(200),
          tap(() => expect(store.get()?.isLoading).toBeTruthy())
        ) as Observable<Partial<STATE>[]>;
      },
      store,
      {
        useStoreLoading: true,
      }
    ).subscribe(result => {
      expect(result[0]).toEqual({
        id: 'x1',
        value: 500,
      });

      const stored = store.getEntity('x1');
      expect(stored).toEqual({
        id: 'x1',
        value: 500,
      });

      expect(store.get()?.isLoading).toBeFalsy();
      store.reset();
      done();
    });
  });
});
