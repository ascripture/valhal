import { firstValueFrom, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

export function silent<T>(x$: Observable<T>) {
  firstValueFrom(x$.pipe(take(1)));
  return of({});
}
