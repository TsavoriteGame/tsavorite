import { Observable, of } from 'rxjs';
import { AddBackpackItem, EncounterCurrentTile, ReplaceNode } from '../actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts, GameConstant } from '../interfaces';
import { nothing } from './helpers/nothing.helpers';

export class ItemOnGround extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ scenario, scenarioNode, callbacks, position, character }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return of({
      landmarkType: 'ItemOnGround',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      playerSlots: [],
      canLeave: true,
      choices: [
        {
          text: 'Take Item',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            const { item } = landmarkEncounter.landmarkData;
            if(!item) {
              callbacks.logger.error('ItemOnGround is missing item data.');
              return of(undefined);
            }

            const itemRef = callbacks.content.createItemById(item);
            if(!itemRef) {
              callbacks.logger.error('ItemOnGround is referencing invalid item data.');
              return of(undefined);
            }

            const backpackSize = callbacks.content.getConstant(GameConstant.BackpackSize);
            if(character.items.length >= backpackSize) {
              callbacks.logger.error('Your backpack is full!');
              return;
            }

            this.store.dispatch(new AddBackpackItem(itemRef));

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
