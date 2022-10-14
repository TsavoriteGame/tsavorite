import { Observable, of } from 'rxjs';
import { sample } from 'lodash';;
import { ChangeAttack } from '../../src/app/core/services/game/actions';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { getAttackByName, getMonsterByName } from '../getters';
import { ILandmark, Landmark, ILandmarkEncounter,
  ILandmarkEncounterOpts, CardFunction, ISlotFunctionOpts,
  IWeaponAttack } from '../interfaces';
import { getAttacksForCharacter, monsterToCharacter } from '../character.helpers';
import { isCombatDone, monsterAttack, playerAttack, resetTimerAndMax } from './helpers/fight.helpers';

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

    const allAttacks = getAttacksForCharacter(encounterOpts.character);

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
      slots: monsters.slice(0, maxMonsters).map((monster, index) => {

        const monsterLetter = String.fromCharCode(65 + index).toUpperCase();
        const monsterName = `${monster.name} ${monsterLetter}`;

        const monsterCharacter = monsterToCharacter(monster);
        const possibleAttacks = getAttacksForCharacter(monsterCharacter);

        const attack = sample(possibleAttacks) || 'Attack';
        const castTime = getAttackTime(attack);

        return {
          showCardSlot: true,
          icon: monster.icon,
          text: `${monsterName} (${monster.hp} HP)`,
          accepts: [],
          timerType: 'danger',
          selectedAttack: attack,
          maxTimer: castTime,
          timer: castTime,
          timerExpired: 'monsterTimerExpired',
          slotData: { hp: monster.hp, baseName: monsterName, character: monster }
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
          slotData: { hp: character.hp, baseName: character.name, character }
        }
      ],
      canLeave: false,
      disallowHealthUpdates: true,
      choices: []
    });
  }

}
