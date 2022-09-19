import { Observable, of } from 'rxjs';
import { Landmark, LandmarkSlot } from '../interfaces';

// needs slots, event area needs number of slots to display.
// slots need timers, things they'll accept, and handlers for the things they accept

export class Shrine implements Landmark {

  readonly icon = 'fireplaceshrine';
  readonly canCancel = false;

  // return slots, what they're filled with
  encounter(): Observable<LandmarkSlot[]> {
    return of([]);
  }

  // run the event, all timers, etc
  run(): Observable<any> {
    return of({});
  }

}
