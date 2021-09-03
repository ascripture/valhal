import { ReplaySubject } from 'rxjs';
import { resettable } from './resettable';

describe('resettable', () => {
  it('resets the subject', done => {
    const bufferSize = 3;

    const { observable, reset, subject } = resettable<number>(
      () => new ReplaySubject(bufferSize)
    );
    const result1: number[] = [];
    const result2: number[] = [];
    const result3: number[] = [];

    observable.subscribe(value => result1.push(value)); // a1, a2, a3, a4, a5, a6
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    observable.subscribe(value => result2.push(value)); // b2, b3, b4, b5, b6

    reset();

    observable.subscribe(value => result3.push(value)); // c5, c6
    subject.next(5);
    subject.next(6);

    setTimeout(() => {
      expect(result1).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result2).toEqual([2, 3, 4, 5, 6]);
      expect(result3).toEqual([5, 6]);
      done();
    });
  });
});
