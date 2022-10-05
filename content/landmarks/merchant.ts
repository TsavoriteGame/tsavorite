import { Observable, of } from 'rxjs';
import { AddBackpackItem, AddCoinsToBackpack, RemoveCharacterItemById,
  RemoveCardFromSlot, RemoveCoinsFromBackpack } from '../../src/app/core/services/game/actions';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts, ICard, IItemConfig, Interaction } from '../interfaces';

import { identity } from './helpers/all.helpers';

export class Merchant extends Landmark implements ILandmark {

  encounter(encounter: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const { scenarioNode, character, callbacks } = encounter;

    const items = scenarioNode.landmarkData.shopItems.map(i => ({
      ...i,
      itemData: callbacks.content.getItemDataById(i.item)
    }));

    const maxItems = callbacks.content.getConstant(GameConstant.LandmarkSlots) - 1;

    return of({
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      slots: [
        ...items.slice(0, maxItems).map(item => ({
          icon: item.itemData.icon,
          text: `${item.itemData.name} (${item.cost} coins)`,
          accepts: ['Item'],
          maxTimer: -1,
          timer: -1,
          cardPlaced: (encounterOpts: ILandmarkEncounter, slotIndex: number, card: ICard) => {
            const itemCheck: IItemConfig = card as IItemConfig;

            if(!itemCheck.interaction || itemCheck.interaction.name !== Interaction.Buys) {
              callbacks.newEventMessage(`You can't buy with ${itemCheck.name}!`);
              this.store.dispatch(new RemoveCardFromSlot(slotIndex));
              return of(encounterOpts);
            }

            const cost = item.cost;
            if(itemCheck.interaction.level < cost) {
              callbacks.newEventMessage(`You don't have enough coins to buy ${item.itemData.name}!`);
              this.store.dispatch(new RemoveCardFromSlot(slotIndex));
              return of(encounterOpts);
            }

            const itemRef = callbacks.content.createItemById(item.item);
            if(!itemRef) {
              callbacks.newEventMessage(`You can't buy ${item.itemData.name}!`);
              this.store.dispatch(new RemoveCardFromSlot(slotIndex));
              return of(encounterOpts);
            }

            const backpackSize = callbacks.content.getConstant(GameConstant.BackpackSize);
            if(character.items.length >= backpackSize) {
              callbacks.newEventMessage('Your backpack is full!');
              this.store.dispatch(new RemoveCardFromSlot(slotIndex));
              return;
            }

            callbacks.newEventMessage(`You bought ${item.itemData.name}!`);
            this.store.dispatch(new AddBackpackItem(itemRef));
            this.store.dispatch(new RemoveCoinsFromBackpack(cost));
            this.store.dispatch(new RemoveCardFromSlot(slotIndex));

            return of(encounterOpts);
          },
          timerExpired: identity
        })),
        {
          card: undefined,
          icon: scenarioNode.icon,
          text: 'Sell',
          locked: false,
          lockOnTimerExpire: false,
          accepts: ['Item'],
          maxTimer: -1,
          timer: -1,
          cardPlaced: (encounterOpts: ILandmarkEncounter, slotIndex: number, card: ICard) => {
            const itemCheck: IItemConfig = card as IItemConfig;

            if(!itemCheck.interaction || itemCheck.interaction.name === Interaction.Buys) {
              callbacks.newEventMessage(`You can't sell ${itemCheck.name}!`);
              this.store.dispatch(new RemoveCardFromSlot(slotIndex));
              return of(encounterOpts);
            }

            const value = itemCheck.interaction.level ?? 1;
            callbacks.newEventMessage(`Thanks for the business, here's ${value} coin(s)!`);
            this.store.dispatch(new RemoveCardFromSlot(slotIndex));
            this.store.dispatch(new RemoveCharacterItemById(card.cardId));
            this.store.dispatch(new AddCoinsToBackpack(value));

            return of(encounterOpts);
          },
          timerExpired: identity
        }
      ],
      playerSlots: [
        {
          card: undefined,
          icon: character.background.icon,
          text: character.name,
          accepts: [],
          maxTimer: -1,
          timer: -1,
          cardPlaced: identity,
          timerExpired: identity
        }
      ],
      canLeave: true,
      choices: []
    });
  }

}
