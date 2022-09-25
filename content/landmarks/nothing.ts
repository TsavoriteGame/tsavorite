import { Observable, of } from 'rxjs';
import { ILandmark, Landmark, ILandmarkEncounter, IScenario, IScenarioNode } from '../interfaces';

export class Nothing extends Landmark implements ILandmark {

  readonly canLeave = true;

  // return slots, what they're filled with
  encounter(scenario: IScenario, scenarioNode: IScenarioNode): Observable<ILandmarkEncounter> {
    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      removeAfterEncounter: false,
      choices: []
    });
  }

}
