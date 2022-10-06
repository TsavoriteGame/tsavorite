import { Observable, of } from 'rxjs';
import { SetLandmarkSlotTimer, SetPlayerSlotTimer } from '../../src/app/core/services/game/actions';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { getAttackByName, getMonsterByName } from '../getters';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts, CardFunction, ISlotFunctionOpts } from '../interfaces';

export const fightHelpers: Record<string, CardFunction> = {
  monsterTimerExpired: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, encounterOpts, slotIndex, card, store } = opts;

    const attackData = getAttackByName(landmarkEncounter.slots[slotIndex].selectedAttack || 'Attack');
    store.dispatch(new SetLandmarkSlotTimer(slotIndex, attackData.castTime, true));
    return of(landmarkEncounter);
  },

  playerTimerExpired: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, encounterOpts, slotIndex, card, store } = opts;

    const attackData = getAttackByName(landmarkEncounter.playerSlots[slotIndex].selectedAttack || 'Attack');
    store.dispatch(new SetPlayerSlotTimer(slotIndex, attackData.castTime, true));
    return of(landmarkEncounter);
  },

  playerCardPlaced: (opts: ISlotFunctionOpts) => {
    const { landmarkEncounter, encounterOpts, slotIndex, card, store } = opts;
    // this.store.dispatch(new Change)
    console.log('placed', card, landmarkEncounter.playerSlots[slotIndex]);
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
          icon: monster.icon,
          text: `${monster.name} (${monster.hp} HP)`,
          accepts: [],
          timerType: 'danger',
          selectedAttack: attack,
          maxTimer: castTime,
          timer: castTime,
          timerExpired: 'monsterTimerExpired',
          timerExpiredOpts: { castTime }
        };
      }),
      playerSlots: [
        {
          icon: character.background.icon,
          text: character.name,
          accepts: ['Attack'],
          selectedAttack: characterAttack,
          maxTimer: characterAttackTime,
          timer: characterAttackTime,
          cardPlaced: 'playerCardPlaced',
          timerExpired: 'playerTimerExpired'
        }
      ],
      canLeave: false,
      choices: []
    });
  }

}
