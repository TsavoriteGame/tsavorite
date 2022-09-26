import { concat, concatMap, delay, from, Observable, of, tap } from 'rxjs';
import { ReplaceNode } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter } from '../interfaces';

export class StrangeLandscape extends Landmark implements ILandmark {

  readonly canLeave = true;

  encounter({ scenarioNode, position }): Observable<ILandmarkEncounter> {
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
        removeAfterEncounter: true,
        choices: []
      }
    ]).pipe(
      concatMap(x => concat(
        of(x),
        of(x)
          .pipe(
            delay(5000),
            tap(() => this.store.dispatch(new ReplaceNode(position, {
              name: 'Changed Landscape',
              icon: 'sunsetvolcano',
              id: 0,
              description: 'This place sure has changed since you saw it last.',
              landmark: 'Nothing',
              landmarkData: {}
            })))
          )
      )),
    );
  }

}
