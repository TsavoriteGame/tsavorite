import { Observable, of } from 'rxjs';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { getAttackByName, getMonsterByName } from '../getters';
import { ILandmark, Landmark, ILandmarkEncounter, ILandmarkEncounterOpts, ICard } from '../interfaces';
import { identity } from './helpers/all.helpers';


export class Fight extends Landmark implements ILandmark {

  encounter({ scenarioNode, character, callbacks }: ILandmarkEncounterOpts): Observable<ILandmarkEncounter> {

    const { landmarkData } = scenarioNode;

    if(!landmarkData || !landmarkData.monsters?.length) {
      return of({
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
          maxTimer: -1,
          timer: -1,
          cardPlaced: identity,
          timerExpired: (landmarkEncounter: ILandmarkEncounter, slot: number) => {
            const attackData = getAttackByName(landmarkEncounter.slots[slot].selectedAttack || 'Attack');
            // this.store.dispatch(new SetLandmarkSlotTimer(slot, attackData.castTime, true));
            return of(landmarkEncounter);
          }
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
          cardPlaced: (landmarkEncounter: ILandmarkEncounter, slot: number, card: ICard) => {
            // this.store.dispatch(new Change)
            console.log('placed', card, landmarkEncounter.playerSlots[slot]);
            return of(landmarkEncounter);
          },
          timerExpired: (landmarkEncounter: ILandmarkEncounter, slot: number) => {
            const attackData = getAttackByName(landmarkEncounter.playerSlots[slot].selectedAttack || 'Attack');
            // this.store.dispatch(new SetPlayerSlotTimer(slot, attackData.castTime, true));
            return of(landmarkEncounter);
          }
        }
      ],
      canLeave: false,
      choices: []
    });
  }

}
