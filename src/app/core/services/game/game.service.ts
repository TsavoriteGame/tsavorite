import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { isNumber } from 'lodash';
import { AddBackpackItem, AddHealth } from './actions';
import { ContentService } from './content.service';
import { LoggerService } from './logger.service';

export enum GameConstant {
  BackpackSize = 'backpackSize'
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private hasOptionsOpen = false;

  public get areOptionsOpen(): boolean {
    return this.hasOptionsOpen;
  }

  private readonly gameConstants: Record<GameConstant, any> = {
    [GameConstant.BackpackSize]: 16
  };

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
    return this.gameConstants[constant];
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
  }
}
