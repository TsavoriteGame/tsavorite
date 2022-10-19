import { sample } from 'lodash';
import { AddBackpackItem, UpdateCharacterPrimaryInformation } from '../../../actions';
import { calculateDamageReductionFromItem } from '../../../armor.helpers';
import { decreaseDescriptorLevel, getReactionBetweenTwoItems, hasDescriptor } from '../../../helpers';
import { ISlotFunctionOpts,
  IWeaponAttack, ILandmarkSlot, EquipmentSlot, IReactionResponse, IItemConfig, Descriptor } from '../../../interfaces';
import { FIGHT_MESSAGES } from '../constants';
import { monsterDie, playerDie } from './fight.death.helpers';
import { updateName } from './fight.misc.helpers';

export const potentiallyDegradeArmor = (item: IItemConfig): IItemConfig | undefined => {
  if(!item) {
    return undefined;
  }

  if(hasDescriptor(item, Descriptor.FeetArmor)) {
    const newLevel = decreaseDescriptorLevel(item, Descriptor.FeetArmor, 1);
    if(newLevel <= 0) {
      return undefined;
    }
  }

  if(hasDescriptor(item, Descriptor.HeadArmor)) {
    const newLevel = decreaseDescriptorLevel(item, Descriptor.HeadArmor, 1);
    if(newLevel <= 0) {
      return undefined;
    }
  }

  if(hasDescriptor(item, Descriptor.BodyArmor)) {
    const newLevel = decreaseDescriptorLevel(item, Descriptor.BodyArmor, 1);
    if(newLevel <= 0) {
      return undefined;
    }
  }

  return item;
};

export const getTargetSlotForAttack = (attack: IWeaponAttack): EquipmentSlot => {
  const slotChoices = [EquipmentSlot.Head, EquipmentSlot.Body, EquipmentSlot.Feet, EquipmentSlot.Hands];

  // if the slot is specified, we move the probability of picking it to 50%
  if(attack.primarySlotTarget) {
    slotChoices.push(...Array(2).fill(attack.primarySlotTarget));
  }

  return sample(slotChoices);
};

export const hitSomeoneAndTheirItems = (
  opts: ISlotFunctionOpts,
  attacker: ILandmarkSlot,
  defender: ILandmarkSlot,
  attack: IWeaponAttack
): IReactionResponse => {
  const attackerCharacter = attacker.slotData.character;
  const defenderCharacter = defender.slotData.character;

  const attackerName = attackerCharacter.name;
  const defenderName = defenderCharacter.name;

  const defenderSlot = getTargetSlotForAttack(attack);

  const attackerHandItem = attackerCharacter.equipment[EquipmentSlot.Hands] || attackerCharacter.body[EquipmentSlot.Hands];
  const defenderItem = defenderCharacter.equipment[defenderSlot] || defenderCharacter.body[defenderSlot];

  const isAttackerUsingBody = attackerCharacter.body[EquipmentSlot.Hands] === attackerHandItem;
  const isDefenderUsingBody = defenderCharacter.body[defenderSlot] === defenderItem;

  const damageReduction = calculateDamageReductionFromItem(defenderItem);
  let damageToDefender = Math.max(1, attack.damage - damageReduction);
  let damageToAttacker = 0;

  // do HP damage
  if(damageToAttacker > 0) {
    const newAttackerHP = attacker.slotData.hp - damageToAttacker;
    attacker.slotData.hp = newAttackerHP;
    opts.encounterOpts.callbacks.newEventLogMessage(`${attackerName} took ${damageToAttacker} damage!`, FIGHT_MESSAGES);
  }

  if(damageToDefender > 0) {
    const newDefenderHP = defender.slotData.hp - damageToDefender;
    defender.slotData.hp = newDefenderHP;
    opts.encounterOpts.callbacks.newEventLogMessage(`${defenderName} took ${damageToDefender} damage!`, FIGHT_MESSAGES);
  }

  const result = getReactionBetweenTwoItems(attackerHandItem, defenderItem);
  if(result.success) {
    const { newSource, newTarget } = result;

    // update the attacker item
    if(isAttackerUsingBody) {

      // if attacker is using their body, and they lose their item, they die
      if(!newSource) {
        damageToAttacker = attacker.slotData.hp;
        opts.encounterOpts.callbacks.newEventLogMessage(`${attackerName} lost their hands!`, FIGHT_MESSAGES);
      }

      attackerCharacter.body[EquipmentSlot.Hands] = newSource;

    } else {
      attackerCharacter.equipment[EquipmentSlot.Hands] = newSource;
    }

    // update the defender item
    if(isDefenderUsingBody) {

      // if defender is using their body, and they lose their item, they die
      if(!newTarget) {
        damageToDefender = defender.slotData.hp;
        opts.encounterOpts.callbacks.newEventLogMessage(`${defenderName} lost their ${defenderSlot}!`, FIGHT_MESSAGES);
      }

      defenderCharacter.body[defenderSlot] = newTarget;

    } else {
      defenderCharacter.equipment[defenderSlot] = potentiallyDegradeArmor(newTarget);
    }

  }

  return result;
};

export const getTargets = (
  user: ILandmarkSlot,
  attack: IWeaponAttack,
  targets: Array<{ slot: ILandmarkSlot; pos: number }>
): Array<{ slot: ILandmarkSlot; pos: number }> => {
  const possibleTargets = targets.filter(target => target.slot.slotData.hp > 0);

  if(possibleTargets.length === 0) {
    return [];
  }

  if(attack.targetting === 'all') {
    return possibleTargets;
  }

  return [sample(possibleTargets)];
};

export const monsterAttack = (opts: ISlotFunctionOpts, userSlot: number, attack: IWeaponAttack) => {
  const possibleTargets = opts.landmarkEncounter.playerSlots;
  const targets = getTargets(opts.landmarkEncounter.slots[userSlot], attack, possibleTargets.map((slot, i) => ({ slot, pos: i })));

  targets.forEach(target => {
    hitSomeoneAndTheirItems(opts, opts.landmarkEncounter.slots[userSlot], target.slot, attack);
    updateName(opts.landmarkEncounter.slots[userSlot]);
    updateName(opts.landmarkEncounter.playerSlots[target.pos]);

    if(opts.landmarkEncounter.playerSlots[target.pos].slotData.hp <= 0) {
      const playerName = opts.landmarkEncounter.playerSlots[target.pos].slotData.character.name;
      opts.encounterOpts.callbacks.newEventLogMessage(`${playerName} died!`, FIGHT_MESSAGES);

      playerDie(opts, target.pos);
    }

    // we only care about the player
    if(target.pos === 0) {
      const characterSlot = opts.landmarkEncounter.playerSlots[target.pos].slotData;
      const character = characterSlot.character;
      opts.store.dispatch(new UpdateCharacterPrimaryInformation(characterSlot.hp, character.body, character.equipment));
    }
  });
};

export const playerAttack = (opts: ISlotFunctionOpts, userSlot: number, attack: IWeaponAttack) => {
  const possibleTargets = opts.landmarkEncounter.slots;
  const targets = getTargets(opts.landmarkEncounter.playerSlots[userSlot], attack, possibleTargets.map((slot, i) => ({ slot, pos: i })));

  targets.forEach(target => {
    const reaction = hitSomeoneAndTheirItems(opts, opts.landmarkEncounter.playerSlots[userSlot], target.slot, attack);
    reaction.extraItems.forEach(item => {
      opts.encounterOpts.callbacks.content.addIdToCard(item);
      opts.store.dispatch(new AddBackpackItem(item));
      opts.encounterOpts.callbacks.newEventLogMessage(`Got ${item.name}!`, FIGHT_MESSAGES);
    });

    updateName(opts.landmarkEncounter.playerSlots[userSlot]);
    updateName(opts.landmarkEncounter.slots[target.pos]);

    if(opts.landmarkEncounter.slots[target.pos].slotData.hp <= 0) {
      const monsterName = opts.landmarkEncounter.slots[target.pos].slotData.character.name;
      opts.encounterOpts.callbacks.newEventLogMessage(`${monsterName} died!`, FIGHT_MESSAGES);

      monsterDie(opts, target.pos);
    }
  });

  // we only care about the player
  if(userSlot === 0) {
    const characterSlot = opts.landmarkEncounter.playerSlots[userSlot].slotData;
    const character = characterSlot.character;
    opts.store.dispatch(new UpdateCharacterPrimaryInformation(characterSlot.hp, character.body, character.equipment));
  }
};
