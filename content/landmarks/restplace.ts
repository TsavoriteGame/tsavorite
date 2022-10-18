import { Observable, of } from 'rxjs';
import { AddHealth, EncounterCurrentTile, ReplaceNode } from '../../src/app/core/services/game/actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

export class RestPlace extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ position, scenarioNode }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const landmarkData = scenarioNode.landmarkData;
    const health = landmarkData.healAmount || 1;

    return of({
      landmarkType: 'RestingPlace',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      playerSlots: [],
      canLeave: false,
      choices: [
        {
          text: `Rest (Restore ${health} HP)`,
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            this.store.dispatch(new AddHealth(health));

            this.store.dispatch(new ReplaceNode(position, {
              name: `${scenarioNode.name} (Expired)`,
              icon: scenarioNode.icon,
              iconFilter: 'grayscale',
              id: -1,
              description: 'The campfire here is all burnt out.',
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
