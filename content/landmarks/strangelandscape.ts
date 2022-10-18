import { concatMap, from, Observable, of, tap } from 'rxjs';
import { ReplaceNode } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';
import { pausableTimer } from '../rxjs.helpers';

export class StrangeLandscape extends Landmark implements ILandmark {

  encounter({ scenarioNode, position }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return from([
      {
        landmarkType: 'StrangeLandscape',
        landmarkName: scenarioNode.name,
        landmarkDescription: scenarioNode.description,
        landmarkIcon: scenarioNode.icon,
        landmarkData: scenarioNode.landmarkData,
        slots: [],
        playerSlots: [],
        canLeave: true,
        choices: []
      },
      {
        landmarkType: 'StrangeLandscape',
        landmarkName: 'Changed Landscape',
        landmarkDescription: 'This place sure has changed explosively.',
        landmarkIcon: 'sunsetvolcano',
        landmarkData: scenarioNode.landmarkData,
        slots: [],
        playerSlots: [],
        canLeave: true,
        choices: []
      }
    ] as ILandmarkEncounter[]).pipe(
      concatMap((v, i) => {
        if(i === 0) {
          return of(v);
        }

        return of(v).pipe(
          pausableTimer(5),
          tap(() => this.store.dispatch(new ReplaceNode(position, {
            name: 'Changed Landscape',
            icon: 'sunsetvolcano',
            id: -1,
            description: 'This place sure has changed since you saw it last.',
            landmark: 'Nothing',
            landmarkData: {}
          })))
        );
      })
    );
  }

}
