import { Observable, of } from 'rxjs';
import { ILandmark, Landmark, LandmarkEncounter, Scenario, ScenarioNode } from '../interfaces';

// needs slots, event area needs number of slots to display.
// slots need timers, things they'll accept, and handlers for the things they accept

export class Shrine extends Landmark implements ILandmark {

  readonly canLeave = false;
  encounter(scenario: Scenario, scenarioNode: ScenarioNode): Observable<LandmarkEncounter> {
    return of(undefined);
  }

}
