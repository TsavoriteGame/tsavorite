import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { isNumber } from 'lodash';
import { getArchetypeByName, getAttackByName, getBackgroundByName,
  getItemById, getMonsterByName, getRecipeByName, getScenarioByName } from '../../../../../content/getters';
import { AddBackpackItem, AddCoinsToBackpack, AddHealth } from '../../../../../content/actions';
import { ContentService } from './content.service';
import { LoggerService } from './logger.service';
import { getConstant } from '../../../../../content/attachments/game/game.anonymous.functions';
import { GameConstant } from '../../../../../content/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private hasOptionsOpen = false;

  public get areOptionsOpen(): boolean {
    return this.hasOptionsOpen;
  }

  // rudimentary, but it works
  public get isInGame(): boolean {
    return this.router.url.includes('/play');
  }

  constructor(
    private router: Router,
    private store: Store,
    private loggerService: LoggerService,
    private contentService: ContentService
  ) {
    this.initConsole();
  }

  public setOptionsOpen(open: boolean): void {
    this.hasOptionsOpen = open;
  }

  public getConstant(constant: GameConstant) {
    return getConstant(constant);
  }

  private initConsole() {
    (window as any).__addItem = (id: string) => {
      const item = this.contentService.getItemById(id);
      if(!item) {
        this.loggerService.error('Item does not exist.');
        return;
      }

      this.store.dispatch(new AddBackpackItem(item));
    };

    (window as any).__modifyHealth = (health: number) => {
      if(isNaN(health) || !isNumber(health)) {
        return;
      }

      this.store.dispatch(new AddHealth(health));
    };

    (window as any).__modifyCoins = (coins: number) => {
      if(isNaN(coins) || !isNumber(coins)) {
        return;
      }

      this.store.dispatch(new AddCoinsToBackpack(coins));
    };

    (window as any).__getItem = getItemById;
    (window as any).__getArchetype = getArchetypeByName;
    (window as any).__getBackground = getBackgroundByName;
    (window as any).__getRecipe = getRecipeByName;
    (window as any).__getScenario = getScenarioByName;
    (window as any).__getMonster = getMonsterByName;
    (window as any).__getAttack = getAttackByName;
  }
}
