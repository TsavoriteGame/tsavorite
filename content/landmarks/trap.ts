import { Observable, of } from 'rxjs';
import { EncounterCurrentTile, ReplaceNode } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter } from '../interfaces';

export class Trap extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ position, scenarioNode }): Observable<ILandmarkEncounter> {
    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      removeAfterEncounter: false,
      canLeave: false,
      choices: [
        {
          text: 'Disarm',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            this.store.dispatch(new ReplaceNode(position, {
              name: 'Broken Trap',
              icon: 'sunsetvolcano',
              id: -1,
              description: 'You broke the trap that kept you here previously.',
              landmark: 'Nothing',
              landmarkData: {}
            })).subscribe(() => {
              this.store.dispatch(new EncounterCurrentTile());
            });

            return of(landmarkEncounter);
          }
        }
      ]
    });
  }

}
