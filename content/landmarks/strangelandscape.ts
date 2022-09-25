import { concat, concatMap, delay, from, Observable, of } from 'rxjs';
import { ILandmark, Landmark, ILandmarkEncounter, IScenario, IScenarioNode } from '../interfaces';

export class StrangeLandscape extends Landmark implements ILandmark {

  readonly canLeave = true;

  // return slots, what they're filled with
  encounter(scenario: IScenario, scenarioNode: IScenarioNode): Observable<ILandmarkEncounter> {
    return from([
      {
        landmarkName: scenarioNode.name,
        landmarkDescription: scenarioNode.description,
        landmarkIcon: scenarioNode.icon,
        landmarkData: scenarioNode.landmarkData,
        slots: [],
        removeAfterEncounter: false,
        choices: []
      },
      {
        landmarkName: 'Changed Landscape',
        landmarkDescription: 'This place sure has changed explosively.',
        landmarkIcon: 'sunsetvolcano',
        landmarkData: scenarioNode.landmarkData,
        slots: [],
        removeAfterEncounter: false,
        choices: []
      }
    ]).pipe(
      concatMap(x => concat(of(x), of(x).pipe(delay(5000))))
    );
  }

}
