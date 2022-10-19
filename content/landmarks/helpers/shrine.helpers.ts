
import { EncounterCurrentTile, ReduceHealth, ReplaceNode, SetCharacterItemLockById,
  SetLandmarkSlotLock, SetLandmarkSlotTimer, UpdateCharacterItemById } from '../../actions';
import { CardFunction, IMapPosition, IScenarioNode, ISlotFunctionOpts, IItemConfig } from '../../interfaces';
import type { Store } from '@ngxs/store';
import { first, of, switchMap, tap, timer } from 'rxjs';
import { sample } from 'lodash';

import { pausableTimer } from '../../rxjs.helpers';
import { decreaseDescriptorLevel, getHighestDescriptorByLevel, increaseInteractionLevel } from '../../helpers';

const doFullReset = (store: Store, position: IMapPosition, scenarioNode: IScenarioNode) => {
  const resetShrine = () => ({
    name: 'Depleted Shrine',
    icon: scenarioNode.icon,
    iconFilter: 'grayscale',
    id: -1,
    description: 'You visited this shrine and depleted the power source.',
    landmark: 'Nothing',
    landmarkData: {}
  });

  store.dispatch(new ReplaceNode(position, resetShrine())).subscribe(() => {
    store.dispatch(new EncounterCurrentTile());
  });
};

export const shrineHelpers: Record<string, CardFunction> = {
  placementCurse: (opts: ISlotFunctionOpts) => {
    const { encounterOpts, landmarkEncounter, slotIndex, card, store } = opts;
    const { callbacks } = encounterOpts;

    store.dispatch(new SetLandmarkSlotLock(slotIndex, true));
    store.dispatch(new SetLandmarkSlotTimer(slotIndex, -1));
    store.dispatch(new SetCharacterItemLockById(card.cardId, true));

    // if it doesn't have parts, it's not really an item we can use in this path
    if(!(card as IItemConfig).parts) {
      return timer(1000)
        .pipe(
          first(),
          tap(() => callbacks.newEventMessage('The shrine deity is thinking...')),
          pausableTimer(5),
          tap(() => callbacks.newEventMessage('The shrine deity rejects your offering!')),
          pausableTimer(5),
          tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
          switchMap(() => of(landmarkEncounter))
        );
    }

    // if it is an item, lower the highest descriptor by 1
    return timer(1000)
      .pipe(
        first(),
        tap(() => callbacks.newEventMessage('The shrine deity is thinking...')),
        pausableTimer(5),
        tap(() => callbacks.newEventMessage('The shrine deity curses your offering!')),
        tap(() => store.dispatch(new SetLandmarkSlotLock(slotIndex, false))),
        tap(() => {
          const item: IItemConfig = card as IItemConfig;
          const highestDescriptor = getHighestDescriptorByLevel(item);

          decreaseDescriptorLevel(item, highestDescriptor, 1);

          store.dispatch(new UpdateCharacterItemById(card.cardId, item));
          store.dispatch(new SetCharacterItemLockById(card.cardId, false));
        }),
        pausableTimer(5),
        tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
        switchMap(() => of(landmarkEncounter))
      );
  },

  placementInteractionBoost: (opts: ISlotFunctionOpts) => {
    const { encounterOpts, landmarkEncounter, slotIndex, card, store } = opts;
    const { callbacks } = encounterOpts;

    store.dispatch(new SetLandmarkSlotLock(slotIndex, true));
    store.dispatch(new SetLandmarkSlotTimer(slotIndex, -1));
    store.dispatch(new SetCharacterItemLockById(card.cardId, true));

    // if it doesn't have parts, it's not really an item we can use in this path
    if(!(card as IItemConfig).parts || !(card as IItemConfig).interaction) {
      return timer(1000)
        .pipe(
          first(),
          tap(() => callbacks.newEventMessage('The shrine deity is thinking...')),
          pausableTimer(5),
          tap(() => callbacks.newEventMessage('The shrine deity rejects your offering!')),
          pausableTimer(5),
          tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
          switchMap(() => of(landmarkEncounter))
        );
    }

    // if it is an item, lower the highest descriptor by 1
    return timer(1000)
      .pipe(
        first(),
        tap(() => callbacks.newEventMessage('The shrine deity is thinking...')),
        pausableTimer(5),
        tap(() => callbacks.newEventMessage('The shrine deity blesses your offering!')),
        tap(() => store.dispatch(new SetLandmarkSlotLock(slotIndex, false))),
        tap(() => {
          const item: IItemConfig = card as IItemConfig;

          increaseInteractionLevel(item, item.interaction.name, 1);

          store.dispatch(new UpdateCharacterItemById(card.cardId, item));
          store.dispatch(new SetCharacterItemLockById(card.cardId, false));
        }),
        pausableTimer(5),
        tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
        switchMap(() => of(landmarkEncounter))
      );
  },

  expireCurse: (opts: ISlotFunctionOpts) => {
    const { encounterOpts, landmarkEncounter, slotIndex, store } = opts;
    const { character, callbacks } = encounterOpts;

    const curseChosenItem = sample(character.items.filter(i => i.parts));
    if(!curseChosenItem) {
      return timer(1000)
        .pipe(
          tap(() => callbacks.newEventMessage('The shrine deity takes your health as penance!')),
          tap(() => store.dispatch(new SetLandmarkSlotLock(slotIndex, false))),
          tap(() => store.dispatch(new ReduceHealth(1))),
          pausableTimer(5),
          tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
          switchMap(() => of(landmarkEncounter))
        );
    }

    return timer(1000)
      .pipe(
        tap(() => callbacks.newEventMessage('The shrine deity curses your indecision!')),
        tap(() => store.dispatch(new SetLandmarkSlotLock(slotIndex, false))),
        tap(() => {
          const item: IItemConfig = curseChosenItem as IItemConfig;
          const highestDescriptor = getHighestDescriptorByLevel(item);

          decreaseDescriptorLevel(item, highestDescriptor, 1);

          store.dispatch(new UpdateCharacterItemById(curseChosenItem.cardId, item));
          store.dispatch(new SetCharacterItemLockById(curseChosenItem.cardId, false));
        }),
        pausableTimer(5),
        tap(() => doFullReset(store, encounterOpts.position, encounterOpts.scenarioNode)),
        switchMap(() => of(landmarkEncounter))
      );
  }
};
