import { take } from 'rxjs/operators';
import { EntityStore } from './entity-store';
import { select } from '../query';

describe('EntityStore', () => {
  it('starts with an empty store', (done) => {
    const store = new EntityStore<{ id: string; value: number }>();

    let run = 0;
    select('x', store).subscribe((data) => {
      expect(data).toBeUndefined();
      run++;
    });

    let called = 0;
    store.asEntityObservable().subscribe(() => {
      called++;
    });

    setTimeout(() => {
      expect(called).toEqual(1);
      expect(run).toEqual(1);
      done();
    });
  });

  it('adds entities to the store', (done) => {
    const store = new EntityStore<{ id: string; value: number }>();

    let run = 0;
    let expectX: number | undefined = undefined;
    select('x', store).subscribe((data) => {
      expect(data?.value).toEqual(expectX);
      run++;
    });

    expectX = 100;
    store.add({
      id: 'x',
      value: 100,
    });

    store.add({
      id: 'y',
      value: 200,
    });

    select('y', store).subscribe((data) => {
      expect(data?.value).toEqual(200);
    });

    let value = 0;
    let called = 0;
    store.asEntityObservable().subscribe((store) => {
      value = Array.from(store.data.values()).reduce(
        (acc, next) => acc + (next?.value ?? 0),
        0
      );
      called++;
    });

    setTimeout(() => {
      expect(value).toEqual(300);
      expect(called).toEqual(1);
      expect(run).toEqual(2);
      done();
    });
  });

  it('removes entities from the store', (done) => {
    const store = new EntityStore<{ id: string; value: number }>();

    store.add({
      id: 'x',
      value: 100,
    });

    store.add({
      id: 'y',
      value: 200,
    });

    store.add({
      id: 'z',
      value: 300,
    });

    select('y', store)
      .pipe(take(1))
      .subscribe((result) => {
        expect(result?.value).toEqual(200);
      });

    const entities1 = store.getAll();

    store.remove('y');

    const entities2 = store.getAll();

    expect(entities1.data.get('y')?.value).toEqual(200);
    expect(entities2.data.get('y')).toBeUndefined();

    select('y', store).subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('caches entities in the store for 500ms', (done) => {
    const store = new EntityStore<{ id: string; value: number }>({
      cacheMS: 500,
      idPath: ['id'],
    });

    store.add({
      id: 'x',
      value: 100,
    });

    store.add({
      id: 'y',
      value: 200,
    });

    store.add({
      id: 'z',
      value: 300,
    });

    setTimeout(() => {
      select('x', store)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result?.value).toEqual(100);
        });
    }, 200);

    setTimeout(() => {
      select('y', store)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result?.value).toEqual(200);
        });
    }, 400);

    setTimeout(() => {
      select('z', store)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result?.value).toEqual(300);
        });
    }, 300);

    setTimeout(() => {
      select('y', store)
        .pipe(take(1))
        .subscribe((result) => {
          expect(result).toBeUndefined();
          store.reset();
          done();
        });
    }, 550);
  });
});
