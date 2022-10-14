
import { AddBackpackItem, AddCoinsToBackpack, ReplaceNode, UpdateCharacterPrimaryInformation } from '../../../../src/app/core/services/game/actions';
import { ISlotFunctionOpts, IModifiableItem, Interaction } from '../../../interfaces';
import { FIGHT_MESSAGES } from '../constants';
import { nothing } from '../nothing.helpers';
import { resetTimerAndMax } from './fight.misc.helpers';

export const dropItems = (opts: ISlotFunctionOpts, itemDrops: IModifiableItem[] = []) => {
  itemDrops.forEach(itemDrop => {
    const item = opts.encounterOpts.callbacks.content.createItemWithModifications(itemDrop.itemId, itemDrop.itemChanges);
    if(!item) {
      return;
    }

    if(item.interaction?.name === Interaction.Buys) {
      opts.store.dispatch(new AddCoinsToBackpack(item.interaction.level ?? 0));
      return;
    }

    opts.store.dispatch(new AddBackpackItem(item));
  });
};

export const didPlayersWin = (opts: ISlotFunctionOpts) => {
  const { landmarkEncounter } = opts;
  return landmarkEncounter.slots.every(slot => slot.slotData.hp <= 0);
};

export const isCombatDone = (opts: ISlotFunctionOpts) => {
  const { landmarkEncounter } = opts;

  const playerAlive = landmarkEncounter.playerSlots.some(slot => slot.slotData.hp > 0);
  const monsterAlive = landmarkEncounter.slots.some(slot => slot.slotData.hp > 0);

  return !playerAlive || !monsterAlive;
};

export const finishCombat = (opts: ISlotFunctionOpts) => {
  const { landmarkEncounter, encounterOpts: { callbacks, position }, store } = opts;

  landmarkEncounter.slots.forEach(slot => {
    slot.locked = true;
    resetTimerAndMax(slot, -1);
  });

  landmarkEncounter.playerSlots.forEach(slot => {
    slot.locked = true;
    resetTimerAndMax(slot, -1);
  });

  if(didPlayersWin(opts)) {
    const itemsWon = landmarkEncounter.landmarkData.itemDrops || [];
    const foundString = itemsWon.map(item => item.description).join(', ') || 'nothing';

    callbacks.newEventLogMessage(`You defeated the monsters! You found ${foundString}.`, FIGHT_MESSAGES);

    dropItems(opts, itemsWon);
  } else {
    callbacks.newEventLogMessage('You were defeated by the monsters!', FIGHT_MESSAGES);
  }

  landmarkEncounter.canLeave = true;
  landmarkEncounter.disallowHealthUpdates = false;

  // update the character info
  const character = landmarkEncounter.playerSlots[0].slotData.character;
  store.dispatch(new UpdateCharacterPrimaryInformation(character.hp, character.body, character.equipment));

  // replace the old fight node with nothing
  store.dispatch(new ReplaceNode(position, nothing()));

};
