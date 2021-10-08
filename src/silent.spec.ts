import { delay, of, tap } from 'rxjs';
import { silent } from './silent';

describe('silent', () => {
  it('calls the silent function but completes before', (done) => {
    const silentSpy = jest.fn();
    silent(
      of({}).pipe(
        delay(1000),
        tap(() => {
          expect(silentSpy).toHaveBeenCalled();
          done();
        })
      )
    ).subscribe(silentSpy);
  });
});
