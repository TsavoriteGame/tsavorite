import { Observable, of } from 'rxjs';
import { EncounterCurrentTile, ReplaceNode } from '../actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';

export class Trap extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ position, scenarioNode }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return of({
      landmarkType: 'Trap',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      playerSlots: [],
      canLeave: false,
      choices: [
        {
          text: 'Disarm',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            this.store.dispatch(new ReplaceNode(position, {
              name: `${scenarioNode.name} (Broken)`,
              icon: scenarioNode.icon,
              iconFilter: 'grayscale',
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
