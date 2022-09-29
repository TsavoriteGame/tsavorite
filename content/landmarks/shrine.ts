import { Observable, of } from 'rxjs';
import { sample } from 'lodash';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

import { helpers as getShrineHelpers } from './helpers/shrine.helpers';

export class Shrine extends Landmark implements ILandmark {

  encounter(encounter: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const { scenarioNode } = encounter;

    const { placementFunctions, timeoutFunctions } = getShrineHelpers(encounter, this.store);

    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [
        {
          card: undefined,
          icon: scenarioNode.icon,
          text: 'Offering',
          locked: false,
          lockOnTimerExpire: true,
          timerType: 'danger',
          maxTimer: 60,
          timer: 60,
          cardPlaced: sample(placementFunctions),
          timerExpired: sample(timeoutFunctions)
        }
      ],
      removeAfterEncounter: false,
      canLeave: false,
      choices: []
    });
  }

}
