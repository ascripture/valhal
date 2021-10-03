import { of } from 'rxjs';
import { debounceTime, delay, tap } from 'rxjs/operators';
import { select } from '..';
import { EntityStore } from '../entity-store';
import { fetch } from './fetch';

describe('fetch', () => {
  it('saved entity in the store', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      idPath: ['id'],
    });

    fetch('x1', () => of({ id: 'x1', value: 500 }), store).subscribe(
      (result) => {
        expect(result).toEqual({
          id: 'x1',
          value: 500,
        });

        const stored = store.getEntity('x1');
        expect(stored).toEqual({
          id: 'x1',
          value: 500,
        });

        done();
      }
    );
  });

  it('used the entity cache', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      cacheMS: 500,
      idPath: ['id'],
    });

    store.add({
      id: 'x1',
      value: 250,
    });

    fetch('x1', () => of({ id: 'x1', value: 500 }), store).subscribe(
      (result) => {
        expect(result).toEqual({
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
      }
    );
  });

  it('didnt use the entity cache for another entity', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      cacheMS: 500,
      idPath: ['id'],
    });

    store.add({
      id: 'x1',
      value: 250,
    });

    fetch('x2', () => of({ id: 'x2', value: 500 }), store).subscribe(
      (result) => {
        expect(result).toEqual({
          id: 'x2',
          value: 500,
        });

        const stored = store.getEntity('x2');
        expect(stored).toEqual({
          id: 'x2',
          value: 500,
        });

        store.reset();

        done();
      }
    );
  });

  it('didnt use the entity cache for the same entity', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>({
      cacheMS: 500,
      idPath: ['id'],
    });

    store.add({
      id: 'x1',
      value: 250,
    });

    setTimeout(() => {
      fetch('x1', () => of({ id: 'x1', value: 500 }), store).subscribe(
        (result) => {
          expect(result).toEqual({
            id: 'x1',
            value: 500,
          });

          const stored = store.getEntity('x1');
          expect(stored).toEqual({
            id: 'x1',
            value: 500,
          });

          store.reset();

          done();
        }
      );
    }, 550);
  });

  it('saved entity in the store with store loading', (done) => {
    type STATE = {
      id: string;
      value: number;
    };

    const store = new EntityStore<STATE>({
      cacheMS: 500,
      idPath: ['id'],
    });

    expect(store.get()?.isLoading).toBeFalsy();

    fetch<string, STATE>(
      'x1',
      (x) =>
        of({ id: x, value: 500 }).pipe(
          delay(200),
          tap(() => expect(store.get()?.isLoading).toBeTruthy())
        ),
      store,
      {
        useStoreLoading: true,
      }
    ).subscribe((result) => {
      expect(result).toEqual({
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

  it('saved entity in the store with entity loading', (done) => {
    interface STATE {
      id: string;
      value: number;
    }

    const store = new EntityStore<STATE>({
      cacheMS: 500,
      idPath: ['id'],
    });

    let shouldShowLoading = false;
    const spy = jest.fn((state) => {
      if (shouldShowLoading) {
        expect(state?.isLoading).toBeTruthy();
      } else {
        expect(state?.isLoading).toBeFalsy();
      }
    });

    select('x1', store.getUIStore()).subscribe(spy);

    setTimeout(() => {
      shouldShowLoading = true;
      fetch(
        'x1',
        (x) =>
          of({ id: x, value: 500 }).pipe(
            debounceTime(200),
            tap(() => (shouldShowLoading = false))
          ),
        store,
        {
          useEntityLoading: true,
        }
      ).subscribe((result) => {
        expect(result).toEqual({
          id: 'x1',
          value: 500,
        });

        const stored = store.getEntity('x1');
        expect(stored).toEqual({
          id: 'x1',
          value: 500,
        });

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);

          store.reset();
          done();
        }, 200);
      });
    }, 200);
  });

  it('saved entity in the store with entity loading and replaces old one', (done) => {
    interface STATE {
      id: string;
      value: number;
    }

    const store = new EntityStore<STATE>({
      cacheMS: 5000,
      idPath: ['id'],
    });

    store.add({
      id: 'x1',
      value: 50,
    });

    let shouldShowLoading = false;
    const spy = jest.fn((state) => {
      if (shouldShowLoading) {
        expect(state?.isLoading).toBeTruthy();
      } else {
        expect(state?.isLoading).toBeFalsy();
      }
    });

    store.getUIStore().add({
      id: 'x1',
      isLoading: false,
    });

    select('x1', store.getUIStore()).subscribe(spy);

    setTimeout(() => {
      shouldShowLoading = true;
      fetch(
        'x1',
        (x) =>
          of({ id: x, value: 500 }).pipe(
            debounceTime(200),
            tap(() => (shouldShowLoading = false))
          ),
        store,
        {
          useEntityLoading: true,
          force: true,
        }
      ).subscribe((result) => {
        expect(result).toEqual({
          id: 'x1',
          value: 500,
        });

        const stored = store.getEntity('x1');
        expect(stored).toEqual({
          id: 'x1',
          value: 500,
        });

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(3);

          store.reset();
          done();
        }, 200);
      });
    }, 200);
  });
});
