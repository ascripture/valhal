import { Store } from '.';

describe('Store', () => {
  it('sets the state of the store', done => {
    const store = new Store<{ value: number }>();

    let run = 0;
    store.asObservable().subscribe(result => {
      expect(result?.value).toEqual(100);
      run++;
    });

    store.set({
      value: 100,
    });

    setTimeout(() => {
      expect(run).toEqual(1);
      done();
    });
  });

  it('remove the state of the store', done => {
    const store = new Store<{ value: number }>();

    let run = 0;
    store.asObservable().subscribe(result => {
      if (run === 0) {
        expect(result?.value).toEqual(100);
      } else {
          expect(result).toBeUndefined();
      }

      run++;
    });

    store.set({
      value: 100,
    });

    setTimeout(() => {
        store.reset();
    });

    setTimeout(() => {
      expect(run).toEqual(2);
      done();
    }, 500);
  });
});
