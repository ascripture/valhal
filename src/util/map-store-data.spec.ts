import { mapStoreData } from '.';

describe('mapStoreData', () => {
  it('maps entity store data by an id', () => {
    const data = new Map();
    data.set('test1', 200);
    data.set('test2', 300);
    data.set('test3', 400);

    const result = mapStoreData('test2', {
      data,
    });

    expect(result).toEqual(300);
  });

  it('maps single store data even with undefined', () => {
    const data = {
      value: 60,
    };

    const result = mapStoreData(undefined, {
      data,
    });

    expect(result).toEqual({
      value: 60,
    });
  });

  it('throws error if no id is given', () => {
    const data = new Map();
    data.set('test1', 200);
    data.set('test2', 300);
    data.set('test3', 400);

    expect(() =>
      mapStoreData(undefined, {
        data,
      })
    ).toThrowError();
  });
});
