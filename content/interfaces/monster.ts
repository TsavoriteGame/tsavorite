import { EquipmentSlot, ICreature } from './character';

export interface IMonsterConfig extends ICreature {
  icon: string;
  equipment: {
    [EquipmentSlot.Head]: string | undefined;
    [EquipmentSlot.Hands]: string | undefined;
    [EquipmentSlot.Body]: string | undefined;
    [EquipmentSlot.Feet]: string | undefined;
  };
}
