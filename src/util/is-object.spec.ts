import { isObject } from './is-object';

describe('IsObject', () => {
  it('number is not an object', () => {
    expect(isObject(5)).toBeFalsy();
  });

  it('date is an object', () => {
    expect(isObject(new Date())).toBeTruthy();
  });

  it('object is an object', () => {
    expect(isObject({})).toBeTruthy();
  });

  it('undefined is not an object', () => {
    expect(isObject(undefined)).toBeFalsy();
  });

  it('null is not an object', () => {
    expect(isObject(null)).toBeFalsy();
  });
});
