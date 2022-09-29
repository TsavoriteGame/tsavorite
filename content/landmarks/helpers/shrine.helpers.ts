
import { first, of, switchMap, tap, timer } from 'rxjs';
import { sample } from 'lodash';
import { EncounterCurrentTile, ReduceHealth, ReplaceNode, SetLandmarkSlotLock,
  SetLandmarkSlotTimer, UpdateBackpackItemById } from '../../../src/app/core/services/game/actions';
import { ILandmarkEncounter, ICard, IItemConfig, CardPlaceFunction, CardTimerFunction, ILandmarkEncounterOpts } from '../../interfaces';
import { decreaseDescriptorLevel, getHighestDescriptorByLevel } from '../../helpers';
import type { Store } from '@ngxs/store';
import { pausableTimer } from '../../rxjs.helpers';

export const helpers = (encounter: ILandmarkEncounterOpts, store: Store) => {

  const { scenarioNode, callbacks, position, character } = encounter;

  const resetShrine = () => ({
    name: 'Depleted Shrine',
    icon: scenarioNode.icon,
    iconFilter: 'grayscale',
    id: -1,
    description: 'You visited this shrine and depleted the power source.',
    landmark: 'Nothing',
    landmarkData: {}
  });

  const doFullReset = () => {
    store.dispatch(new ReplaceNode(position, resetShrine())).subscribe(() => {
      store.dispatch(new EncounterCurrentTile());
    });
  };

  const placementFunctions: CardPlaceFunction[] = [

    // "cursed"
    (encounterOpts: ILandmarkEncounter, slotIndex: number, card: ICard) => {
      store.dispatch(new SetLandmarkSlotLock(slotIndex, true));
      store.dispatch(new SetLandmarkSlotTimer(slotIndex, -1));

      // if it doesn't have parts, it's not really an item we can use in this path
      if(!(card as IItemConfig).parts) {
        return timer(1000)
          .pipe(
            first(),
            tap(() => callbacks.newEventMessage('The shrine deity is thinking...')),
            pausableTimer(5),
            tap(() => callbacks.newEventMessage('The shrine deity rejects your offering!')),
            pausableTimer(5),
            tap(() => doFullReset()),
            switchMap(() => of(encounterOpts))
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

            store.dispatch(new UpdateBackpackItemById(card.cardId, item));
          }),
          pausableTimer(5),
          tap(() => doFullReset()),
          switchMap(() => of(encounterOpts))
        );
    }
  ];

  const timeoutFunctions: CardTimerFunction[] = [

    // "curse"
    (encounterOpts: ILandmarkEncounter, slotIndex: number) => {
      const curseChosenItem = sample(character.items.filter(i => i.parts));
      if(!curseChosenItem) {
        return timer(1000)
          .pipe(
            tap(() => callbacks.newEventMessage('The shrine deity takes your health as penance!')),
            tap(() => store.dispatch(new SetLandmarkSlotLock(slotIndex, false))),
            tap(() => store.dispatch(new ReduceHealth(1))),
            pausableTimer(5),
            tap(() => doFullReset()),
            switchMap(() => of(encounterOpts))
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

            store.dispatch(new UpdateBackpackItemById(curseChosenItem.cardId, item));
          }),
          pausableTimer(5),
          tap(() => doFullReset()),
          switchMap(() => of(encounterOpts))
        );
    }
  ];

  return { placementFunctions, timeoutFunctions };
};
