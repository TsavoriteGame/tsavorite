
import { BehaviorSubject, combineLatest, delayWhen, filter, interval,
  MonoTypeOperatorFunction, of, skipWhile, Subject, switchMap, takeUntil, tap } from 'rxjs';

export const pauseGame = new BehaviorSubject<boolean>(false);
export const pauseGame$ = pauseGame.asObservable();

export function pausableTimer(
  numSeconds: number
): MonoTypeOperatorFunction<any> {

  return delayWhen((source) => {

    const cleanSeconds = Math.max(1, Math.floor(numSeconds));
    const end$ = new Subject<boolean>();

    let accumulator = 0;
    const interval$ = interval(1000);

    return combineLatest([pauseGame$, interval$]).pipe(
      takeUntil(end$),
      filter(([isPaused]) => !isPaused),
      switchMap(() => of(source)),
      tap(() => accumulator++),
      skipWhile(() => accumulator < cleanSeconds),
      tap(() => end$.next(true)),
    );
  });

}
