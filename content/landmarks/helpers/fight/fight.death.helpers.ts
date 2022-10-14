import { ISlotFunctionOpts } from '../../../interfaces';
import { resetTimerAndMax } from './fight.misc.helpers';
import { finishCombat, isCombatDone } from './fight.victory.helpers';

export const monsterDie = (opts: ISlotFunctionOpts, deadSlot: number) => {
  const { landmarkEncounter } = opts;

  landmarkEncounter.slots[deadSlot].slotData.hp = 0;
  landmarkEncounter.slots[deadSlot].locked = true;
  resetTimerAndMax(landmarkEncounter.slots[deadSlot], -1);
  landmarkEncounter.slots[deadSlot].selectedAttack = undefined;

  if(isCombatDone(opts)) {
    finishCombat(opts);
  }
};

export const playerDie = (opts: ISlotFunctionOpts, deadSlot: number) => {
  const { landmarkEncounter } = opts;

  landmarkEncounter.playerSlots[deadSlot].slotData.hp = 0;
  landmarkEncounter.playerSlots[deadSlot].locked = true;
  resetTimerAndMax(landmarkEncounter.playerSlots[deadSlot], -1);
  landmarkEncounter.playerSlots[deadSlot].selectedAttack = undefined;

  if(isCombatDone(opts)) {
    finishCombat(opts);
  }
};
