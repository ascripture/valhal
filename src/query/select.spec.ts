import { EntityStore } from '../entity-store';
import { select } from './select';

describe('select', () => {
  it('selects undefined in an empty store', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>();

    select('test2', store).subscribe((result) => {
      expect(result?.value).toBeUndefined();
      done();
    });
  });

  it('selects the initial value in an empty store', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>();

    select('test2', store, {
      initialValue: { id: 'test2', value: 50 },
    }).subscribe((result) => {
      expect(result?.value).toEqual(50);
      done();
    });
  });

  it('selects an entity', (done) => {
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

    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(200);
      done();
    });
  });

  it('selects an entity multiple times', (done) => {
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

    let run = 0;
    let expected = 200;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run++;
    });

    let run2 = 0;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run2++;
    });

    expected = 600;
    store.updateEntity({
      id: 'test2',
      value: 600,
    });

    let run3 = 0;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run3++;
    });

    expected = 800;
    store.updateEntity({
      id: 'test2',
      value: 800,
    });

    setTimeout(() => {
      expect(run).toEqual(3);
      expect(run2).toEqual(3);
      expect(run3).toEqual(2);
      done();
    }, 200);
  });

  it('selects an entity even after resetting', (done) => {
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

    let run = 0;
    let expected: number | undefined = 200;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run++;
    });

    let run2 = 0;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run2++;
    });

    expected = undefined;
    store.reset();

    expected = 600;
    store.upsert({
      id: 'test2',
      value: 600,
    });

    let run3 = 0;
    select('test2', store).subscribe((result) => {
      expect(result?.value).toEqual(expected);
      run3++;
    });

    setTimeout(() => {
      expect(run).toEqual(3);
      expect(run2).toEqual(3);
      expect(run3).toEqual(1);
      done();
    }, 200);
  });

  it('selects an entity and reacts to changes', (done) => {
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
    select('test2', store).subscribe((result) => {
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

  it('selects an initial value and reacts to changes', (done) => {
    const store = new EntityStore<{
      id: string;
      value: number;
    }>();

    store.add({
      id: 'test',
      value: 100,
    });

    store.add({
      id: 'test3',
      value: 300,
    });

    let expectation = 400;
    let lastRun = false;
    select('test2', store, {
      initialValue: { id: 'test2', value: 400 },
    }).subscribe((result) => {
      expect(result?.value).toEqual(expectation);

      if (lastRun) {
        done();
      }
    });

    setTimeout(() => {
      lastRun = true;
      expectation = 900;
      store.upsert({
        id: 'test2',
        value: 900,
      });
    }, 200);
  });
});
