import { Observable, of } from 'rxjs';
import { isUndefined } from 'lodash';
import { Warp } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

export class Teleporter extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ scenario, scenarioNode, callbacks }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      canLeave: true,
      choices: [
        {
          text: 'Teleport',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            if(isUndefined(scenarioNode.landmarkData.warpToWorld) || isUndefined(scenarioNode.landmarkData.warpToLandmark)) {
              callbacks.logger.error('Teleporter is missing warp data.');
              return of(undefined);
            }

            this.store.dispatch(new Warp(scenario, scenarioNode.landmarkData.warpToWorld, scenarioNode.landmarkData.warpToLandmark));

            return of(landmarkEncounter);
          }
        }
      ]
    });
  }

}
