import { Observable, of } from 'rxjs';
import { sample } from 'lodash';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

import { helpers as getShrineHelpers } from './helpers/shrine.helpers';
import { identity } from './helpers/all.helpers';

export class Shrine extends Landmark implements ILandmark {

  encounter(encounter: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const { scenarioNode, character } = encounter;

    const { placementFunctions, timeoutFunctions } = getShrineHelpers(encounter, this.store);

    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [
        {
          icon: scenarioNode.icon,
          text: 'Offering',
          lockOnTimerExpire: true,
          timerType: 'danger',
          accepts: ['Item'],
          maxTimer: 60,
          timer: 60,
          cardPlaced: sample(placementFunctions),
          timerExpired: sample(timeoutFunctions)
        }
      ],
      playerSlots: [
        {
          card: undefined,
          icon: character.background.icon,
          text: character.name,
          accepts: [],
          maxTimer: -1,
          timer: -1,
          cardPlaced: identity,
          timerExpired: identity
        }
      ],
      canLeave: false,
      choices: []
    });
  }

}
