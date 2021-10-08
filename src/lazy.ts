import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

export function lazy<T>(x$: Observable<T>) {
  x$.pipe(take(1)).subscribe(() => {});
  return of({});
}
