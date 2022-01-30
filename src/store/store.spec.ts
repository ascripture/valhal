import { Store } from '.';

describe('Store', () => {
  it('logs the current state', (done) => {
    const store = new Store<{ id: string; value: number }>({
      idPath: ['id'],
      logState: true,
    });

    const spy = jest.spyOn(global.console, 'info');

    store.set({
      id: 'test',
      value: 1,
    });

    expect(spy).toHaveBeenCalledWith('Store State: ', {
      id: 'test',
      value: 1,
    });

    done();
  });

  it('timeout works as expected', (done) => {
    const store = new Store<{ value: number }>({ cacheMS: 1500 });

    store.set({
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

  it('sets the state of the store', (done) => {
    const store = new Store<{ value: number }>();

    let run = 0;
    let expectation: number | undefined = undefined;
    store.asObservable().subscribe((result) => {
      expect(result?.value).toEqual(expectation);
      run++;
    });

    expectation = 100;
    store.set({
      value: 100,
    });

    setTimeout(() => {
      expect(run).toEqual(2);
      done();
    });
  });

  it('remove the state of the store', (done) => {
    const store = new Store<{ value: number }>();

    let run = 0;
    store.asObservable().subscribe((result) => {
      if (run === 0) {
        expect(result?.value).toEqual(undefined);
      } else if (run === 1) {
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
      expect(run).toEqual(3);
      done();
    }, 500);
  });
});
