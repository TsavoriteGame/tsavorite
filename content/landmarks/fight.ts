import { Observable, of } from 'rxjs';
import { sample } from 'lodash';;
import { AddBackpackItem, AddCoinsToBackpack, ChangeAttack, ReplaceNode, SetHealth } from '../../src/app/core/services/game/actions';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { EquipmentSlot } from '../../src/app/core/services/game/stores';
import { getAttackByName, getMonsterByName } from '../getters';
import { ILandmark, Landmark, ILandmarkEncounter,
  ILandmarkEncounterOpts, CardFunction, ISlotFunctionOpts,
  IWeaponAttack, ILandmarkSlot, IModifiableItem, Interaction } from '../interfaces';
import { nothing } from './helpers/nothing.helpers';

const dropItems = (opts: ISlotFunctionOpts, itemDrops: IModifiableItem[] = []) => {
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

const didPlayersWin = (opts: ISlotFunctionOpts) => {
  const { landmarkEncounter } = opts;
  return landmarkEncounter.slots.every(slot => slot.slotData.hp <= 0);
};

const isCombatDone = (opts: ISlotFunctionOpts) => {
  const { landmarkEncounter } = opts;

  const playerAlive = landmarkEncounter.playerSlots.some(slot => slot.slotData.hp > 0);
  const monsterAlive = landmarkEncounter.slots.some(slot => slot.slotData.hp > 0);

  return !playerAlive || !monsterAlive;
};

const resetTimerAndMax = (slot: ILandmarkSlot, timer: number) => {
  slot.timer = timer;
  slot.maxTimer = timer;
};

const updateName = (slot: ILandmarkSlot) => {
  const { slotData } = slot;
  if(slotData.hp <= 0) {
    slot.text = `${slotData.baseName} (Dead)`;
    return;
  }

  slot.text = `${slotData.baseName} (${slotData.hp} HP)`;
};

const finishCombat = (opts: ISlotFunctionOpts) => {
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

    callbacks.newEventMessage(`You defeated the monsters! You found ${foundString}.`);

    dropItems(opts, itemsWon);
  } else {
    callbacks.newEventMessage('You were defeated by the monsters!');
  }

  landmarkEncounter.canLeave = true;
  landmarkEncounter.disallowHealthUpdates = false;

  // player slot 0 will always be the real player
  const playerHP = landmarkEncounter.playerSlots[0].slotData.hp;
  store.dispatch(new SetHealth(playerHP));
  store.dispatch(new ReplaceNode(position, nothing()));

};

const getTargets = (
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

const monsterDie = (opts: ISlotFunctionOpts, deadSlot: number) => {
  const { landmarkEncounter } = opts;

  landmarkEncounter.slots[deadSlot].slotData.hp = 0;
  landmarkEncounter.slots[deadSlot].locked = true;
  resetTimerAndMax(landmarkEncounter.slots[deadSlot], -1);
  landmarkEncounter.slots[deadSlot].selectedAttack = undefined;

  if(isCombatDone(opts)) {
    finishCombat(opts);
  }
};

const playerDie = (opts: ISlotFunctionOpts, deadSlot: number) => {
  const { landmarkEncounter } = opts;

  landmarkEncounter.playerSlots[deadSlot].slotData.hp = 0;
  landmarkEncounter.playerSlots[deadSlot].locked = true;
  resetTimerAndMax(landmarkEncounter.playerSlots[deadSlot], -1);
  landmarkEncounter.playerSlots[deadSlot].selectedAttack = undefined;

  if(isCombatDone(opts)) {
    finishCombat(opts);
  }
};

const monsterAttack = (opts: ISlotFunctionOpts, userSlot: number, attack: IWeaponAttack) => {
  const possibleTargets = opts.landmarkEncounter.playerSlots;
  const targets = getTargets(opts.landmarkEncounter.slots[userSlot], attack, possibleTargets.map((slot, i) => ({ slot, pos: i })));

  targets.forEach(target => {
    const newHP = target.slot.slotData.hp - attack.damage;
    opts.landmarkEncounter.playerSlots[target.pos].slotData.hp = newHP;
    updateName(opts.landmarkEncounter.playerSlots[target.pos]);

    if(newHP <= 0) {
      playerDie(opts, target.pos);
    }
  });
};

const playerAttack = (opts: ISlotFunctionOpts, userSlot: number, attack: IWeaponAttack) => {
  const possibleTargets = opts.landmarkEncounter.slots;
  const targets = getTargets(opts.landmarkEncounter.playerSlots[userSlot], attack, possibleTargets.map((slot, i) => ({ slot, pos: i })));

  targets.forEach(target => {
    const newHP = target.slot.slotData.hp - attack.damage;
    opts.landmarkEncounter.slots[target.pos].slotData.hp = newHP;
    updateName(opts.landmarkEncounter.slots[target.pos]);

    if(newHP <= 0) {
      monsterDie(opts, target.pos);
    }
  });
};

export const fightHelpers: Record<string, CardFunction> = {

  monsterTimerExpired: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, slotIndex } = opts;

    const attackData = getAttackByName(landmarkEncounter.slots[slotIndex].selectedAttack || 'Attack');

    const shouldCoolDown = landmarkEncounter.slots[slotIndex].slotData.cooldownCD;
    if(shouldCoolDown) {
      landmarkEncounter.slots[slotIndex].timerType = 'danger';
      landmarkEncounter.slots[slotIndex].slotData.cooldownCD = false;
      resetTimerAndMax(landmarkEncounter.slots[slotIndex], attackData.castTime);
      return of(landmarkEncounter);
    }

    monsterAttack(opts, slotIndex, attackData);

    // if combat is done after the attack, don't reset timers or anything
    if(isCombatDone(opts)) {
      return of(landmarkEncounter);
    }

    if(attackData.cooldown > 1) {
      landmarkEncounter.slots[slotIndex].timerType = 'cooldown';
      landmarkEncounter.slots[slotIndex].slotData.cooldownCD = true;
      resetTimerAndMax(landmarkEncounter.slots[slotIndex], attackData.cooldown);
    } else {
      resetTimerAndMax(landmarkEncounter.slots[slotIndex], attackData.castTime);
    }

    return of(landmarkEncounter);
  },

  playerTimerExpired: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, encounterOpts, slotIndex, store } = opts;

    let attackData: IWeaponAttack = getAttackByName(landmarkEncounter.playerSlots[slotIndex].selectedAttack || 'Attack');

    // handle cooldowns
    const shouldCoolDown = landmarkEncounter.playerSlots[slotIndex].slotData.cooldownCD;
    if(shouldCoolDown) {
      landmarkEncounter.playerSlots[slotIndex].timerType = '';
      landmarkEncounter.playerSlots[slotIndex].slotData.cooldownCD = false;
      resetTimerAndMax(landmarkEncounter.playerSlots[slotIndex], attackData.castTime);
      return of(landmarkEncounter);
    }

    const allAttacks = ['Attack', ...encounterOpts.character.equipment[EquipmentSlot.Hands]?.attacks ?? []];

    // validate that the new attack exists
    let changeToAttack = landmarkEncounter.playerSlots[slotIndex].card?.name;
    if(changeToAttack && !allAttacks.includes(changeToAttack)) {
      changeToAttack = 'Attack';
    }

    // if we have to change attacks, set up the new attack data
    if(changeToAttack) {
      const changeAttackData = getAttackByName(changeToAttack);
      if(changeAttackData) {
        attackData = changeAttackData;
        landmarkEncounter.playerSlots[slotIndex].card = undefined;
        landmarkEncounter.playerSlots[slotIndex].selectedAttack = changeToAttack;
        store.dispatch(new ChangeAttack(changeToAttack));
      }

    }

    playerAttack(opts, slotIndex, attackData);

    // if combat is done after the attack, don't reset timers or anything
    if(isCombatDone(opts)) {
      return of(landmarkEncounter);
    }

    // if the cooldown is >1 second, we put it on cooldown
    // for some unknown reason, if the cooldown is 1 it doesn't work
    // if it's 0, we immediately reset though
    if(attackData.cooldown) {
      landmarkEncounter.playerSlots[slotIndex].timerType = 'cooldown';
      landmarkEncounter.playerSlots[slotIndex].slotData.cooldownCD = true;
      resetTimerAndMax(landmarkEncounter.playerSlots[slotIndex], attackData.cooldown);
    } else {
      resetTimerAndMax(landmarkEncounter.playerSlots[slotIndex], attackData.castTime);
    }

    return of(landmarkEncounter);
  }
};

export class Fight extends Landmark implements ILandmark {

  encounter({ scenarioNode, character, callbacks }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {

    const { landmarkData } = scenarioNode;

    if(!landmarkData || !landmarkData.monsters?.length) {
      return of({
        landmarkType: 'Fight',
        landmarkName: scenarioNode.name,
        landmarkDescription: scenarioNode.description,
        landmarkIcon: scenarioNode.icon,
        landmarkData: scenarioNode.landmarkData,
        slots: [],
        playerSlots: [],
        canLeave: true,
        choices: []
      });
    }

    const maxMonsters = callbacks.content.getConstant(GameConstant.PlayerSlots);

    const monsters = landmarkData.monsters.map(({ name }) => getMonsterByName(name));

    const getAttackTime = (attackName: string) => getAttackByName(attackName).castTime;

    const characterAttack = character.chosenAttack || 'Attack';
    const characterAttackTime = getAttackTime(characterAttack);

    return of({
      landmarkType: 'Fight',
      landmarkName: scenarioNode.name,
      landmarkDescription: scenarioNode.description,
      landmarkIcon: scenarioNode.icon,
      landmarkData: scenarioNode.landmarkData,
      showPlayerAttack: true,
      slots: monsters.slice(0, maxMonsters).map(monster => {
        const attack = monster.attacks[0] || 'Attack';
        const castTime = getAttackTime(attack);

        return {
          showCardSlot: true,
          icon: monster.icon,
          text: `${monster.name} (${monster.hp} HP)`,
          accepts: [],
          timerType: 'danger',
          selectedAttack: attack,
          maxTimer: castTime,
          timer: castTime,
          timerExpired: 'monsterTimerExpired',
          slotData: { hp: monster.hp, baseName: monster.name }
        };
      }),
      playerSlots: [
        {
          showCardSlot: true,
          icon: character.background.icon,
          text: `${character.name} (${character.hp} HP)`,
          accepts: ['Attack'],
          selectedAttack: characterAttack,
          maxTimer: characterAttackTime,
          timer: characterAttackTime,
          timerExpired: 'playerTimerExpired',
          slotData: { hp: character.hp, baseName: character.name }
        }
      ],
      canLeave: false,
      disallowHealthUpdates: true,
      choices: []
    });
  }

}
