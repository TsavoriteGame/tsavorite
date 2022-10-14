import { Observable, of } from 'rxjs';
import { sample } from 'lodash';

import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

import { shrineHelpers } from './helpers/shrine.helpers';

export * from './helpers/shrine.helpers';

export class Shrine extends Landmark implements ILandmark {

  encounter(encounter: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const { scenarioNode, character } = encounter;

    return of({
      landmarkType: 'Shrine',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [
        {
          showCardSlot: true,
          icon: scenarioNode.icon,
          text: 'Offering',
          lockOnTimerExpire: true,
          timerType: 'danger',
          accepts: ['Item'],
          maxTimer: 30,
          timer: 30,
          hideTimerWhenCardPresent: true,
          cardPlaced: sample(Object.keys(shrineHelpers).filter(h => h.includes('placement'))),
          timerExpired: sample(Object.keys(shrineHelpers).filter(h => h.includes('expire')))
        }
      ],
      playerSlots: [
        {
          card: undefined,
          icon: character.background.icon,
          text: character.name,
          accepts: [],
          maxTimer: -1,
          timer: -1
        }
      ],
      canLeave: false,
      choices: []
    });
  }

}
