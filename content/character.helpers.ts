import { getItemById } from './getters';
import { IMonsterConfig } from './interfaces';
import { EquipmentSlot, ICharacter } from './interfaces/character';

export function getAttacksForCharacter(char: ICharacter): string[] {
  const mainHand = char.equipment[EquipmentSlot.Hands];
  const weaponAttacks = mainHand?.attacks || [];

  return weaponAttacks.length > 0 ? weaponAttacks : ['Attack'];
}

export function monsterToCharacter(monster: IMonsterConfig): ICharacter {
  return {
    ...monster,
    equipment: {
      [EquipmentSlot.Head]: getItemById(monster.equipment[EquipmentSlot.Head]),
      [EquipmentSlot.Hands]: getItemById(monster.equipment[EquipmentSlot.Hands]),
      [EquipmentSlot.Body]: getItemById(monster.equipment[EquipmentSlot.Body]),
      [EquipmentSlot.Feet]: getItemById(monster.equipment[EquipmentSlot.Feet]),
    },
    items: [],
    powers: [],
  };
}
