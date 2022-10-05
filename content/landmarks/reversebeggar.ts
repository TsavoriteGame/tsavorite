import { Observable, of } from 'rxjs';
import { AddCoinsToBackpack, EncounterCurrentTile, ReplaceNode } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';
import { nothing } from './helpers/nothing.helpers';

export class ReverseBeggar extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ scenarioNode, position }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      playerSlots: [],
      canLeave: true,
      choices: [
        {
          text: 'Accept Coin',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            this.store.dispatch(new AddCoinsToBackpack(1));

            this.store.dispatch(new ReplaceNode(position, nothing())).subscribe(() => {
              this.store.dispatch(new EncounterCurrentTile());
            });

            return of(landmarkEncounter);
          }
        }
      ]
    });
  }

}
