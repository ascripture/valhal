import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

export function silent<T>(x$: Observable<T>) {
  x$.pipe(take(1)).toPromise();
  return of({});
}
