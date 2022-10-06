import { Observable, of } from 'rxjs';
import { AddBackpackItem, AddCoinsToBackpack, RemoveCharacterItemById,
  RemoveCardFromSlot, RemoveCoinsFromBackpack } from '../../src/app/core/services/game/actions';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { ILandmark, Landmark, ILandmarkEncounter,
  ILandmarkEncounterOpts, IItemConfig, Interaction, CardFunction, ISlotFunctionOpts } from '../interfaces';

export const merchantHelpers: Record<string, CardFunction> = {
  buyItem: (opts: ISlotFunctionOpts) => {
    const { encounterOpts, landmarkEncounter, slotIndex, card, store, extraOpts } = opts;
    const { character, callbacks } = encounterOpts;

    const item = extraOpts.item;

    const itemCheck: IItemConfig = card as IItemConfig;

    if(!itemCheck.interaction || itemCheck.interaction.name !== Interaction.Buys) {
      callbacks.newEventMessage(`You can't buy with ${itemCheck.name}!`);
      store.dispatch(new RemoveCardFromSlot(slotIndex));
      return of(landmarkEncounter);
    }

    const cost = item.cost;
    if(itemCheck.interaction.level < cost) {
      callbacks.newEventMessage(`You don't have enough coins to buy ${item.itemData.name}!`);
      store.dispatch(new RemoveCardFromSlot(slotIndex));
      return of(landmarkEncounter);
    }

    const itemRef = callbacks.content.createItemById(item.item);
    if(!itemRef) {
      callbacks.newEventMessage(`You can't buy ${item.itemData.name}!`);
      store.dispatch(new RemoveCardFromSlot(slotIndex));
      return of(landmarkEncounter);
    }

    const backpackSize = callbacks.content.getConstant(GameConstant.BackpackSize);
    if(character.items.length >= backpackSize) {
      callbacks.newEventMessage('Your backpack is full!');
      store.dispatch(new RemoveCardFromSlot(slotIndex));
      return;
    }

    callbacks.newEventMessage(`You bought ${item.itemData.name}!`);
    store.dispatch(new AddBackpackItem(itemRef));
    store.dispatch(new RemoveCoinsFromBackpack(cost));
    store.dispatch(new RemoveCardFromSlot(slotIndex));

    return of(landmarkEncounter);
  },

  sellItem: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, encounterOpts, slotIndex, card, store } = opts;
    const { callbacks } = encounterOpts;

    const itemCheck: IItemConfig = card as IItemConfig;

    if(!itemCheck.interaction || itemCheck.interaction.name === Interaction.Buys) {
      callbacks.newEventMessage(`You can't sell ${itemCheck.name}!`);
      store.dispatch(new RemoveCardFromSlot(slotIndex));
      return of(landmarkEncounter);
    }

    const value = itemCheck.interaction.level ?? 1;
    callbacks.newEventMessage(`Thanks for the business, here's ${value} coin(s)!`);
    store.dispatch(new RemoveCardFromSlot(slotIndex));
    store.dispatch(new RemoveCharacterItemById(card.cardId));
    store.dispatch(new AddCoinsToBackpack(value));

    return of(landmarkEncounter);
  }

};

export class Merchant extends Landmark implements ILandmark {

  encounter(encounter: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {
    const { scenarioNode, character, callbacks } = encounter;

    const items = scenarioNode.landmarkData.shopItems.map(i => ({
      ...i,
      itemData: callbacks.content.getItemDataById(i.item)
    }));

    const maxItems = callbacks.content.getConstant(GameConstant.LandmarkSlots) - 1;

    return of({
      landmarkType: 'Merchant',
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
          cardPlacedOpts: { item },
          cardPlaced: 'buyItem',
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
          cardPlaced: 'sellItem'
        }
      ],
      playerSlots: [
        {
          card: undefined,
          icon: character.background.icon,
          text: character.name,
          accepts: [],
          maxTimer: -1,
          timer: -1
        }
      ],
      canLeave: true,
      choices: []
    });
  }

}
