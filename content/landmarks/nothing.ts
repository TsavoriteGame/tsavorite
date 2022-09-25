import { Observable, of } from 'rxjs';
import { ILandmark, Landmark, LandmarkEncounter, Scenario, ScenarioNode } from '../interfaces';

export class Nothing extends Landmark implements ILandmark {

  readonly canLeave = true;

  // return slots, what they're filled with
  encounter(scenario: Scenario, scenarioNode: ScenarioNode): Observable<LandmarkEncounter> {
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
