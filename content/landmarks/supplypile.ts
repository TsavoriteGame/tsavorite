import { Observable, of } from 'rxjs';
import { sample } from 'lodash';
import { AddBackpackItem, ReplaceNode } from '../actions';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts } from '../interfaces';
import { nothing } from './helpers/nothing.helpers';

export class SupplyPile extends Landmark implements ILandmark {

  // return slots, what they're filled with
  encounter({ position, scenarioNode, callbacks }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    return of({
      landmarkType: 'SupplyPile',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [],
      playerSlots: [],
      canLeave: true,
      choices: [
        {
          text: 'Loot',
          callback: (landmarkEncounter: ILandmarkEncounter) => {
            const itemDrops = landmarkEncounter.landmarkData.itemDrops;
            const itemChoices = itemDrops.map(
              itemDrop => ({
                item: callbacks.content.createItemWithModifications(itemDrop.itemId, itemDrop.itemChanges || {}),
                itemName: itemDrop.description
              })
            ).filter(x => x.item);

            const item = sample(itemChoices);
            if(!item.item) {
              return of(landmarkEncounter);
            }

            this.store.dispatch(new AddBackpackItem(item.item));

            callbacks.newEventLogMessage(`You found ${item.itemName}!`, 3);

            this.store.dispatch(new ReplaceNode(position, nothing()));

            return of({ ...landmarkEncounter, choices: [] });
          }
        }
      ]
    });
  }

}
