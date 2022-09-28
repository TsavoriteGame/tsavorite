import { Observable, of } from 'rxjs';
import { ILandmark, Landmark, ILandmarkEncounter } from '../interfaces';


export class Nothing extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ scenarioNode }): Observable<ILandmarkEncounter> {
    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      removeAfterEncounter: false,
      canLeave: true,
      choices: []
    });
  }

}
