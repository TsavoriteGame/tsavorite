import { ILandmarkSlot } from '../../../interfaces';

export const resetTimerAndMax = (slot: ILandmarkSlot, timer: number) => {
  slot.timer = timer;
  slot.maxTimer = timer;
};

export const updateName = (slot: ILandmarkSlot) => {
  const { slotData } = slot;
  if(slotData.hp <= 0) {
    slot.text = `${slotData.baseName} (Dead)`;
    return;
  }

  slot.text = `${slotData.baseName} (${slotData.hp} HP)`;
};
