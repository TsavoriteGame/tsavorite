import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AddBackpackItem } from './actions';
import { ContentService } from './content.service';

export enum GameConstant {
  BackpackSize = 'backpackSize'
}

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly gameConstants: Record<GameConstant, any> = {
    [GameConstant.BackpackSize]: 16
  };

  // rudimentary, but it works
  public get isInGame(): boolean {
    return this.router.url.includes('/play');
  }

  constructor(private router: Router, private store: Store, private contentService: ContentService) {
    this.initConsole();
  }

  public getConstant(constant: GameConstant) {
    return this.gameConstants[constant];
  }

  private initConsole() {
    (window as any).__addItem = (id: string) => {
      const item = this.contentService.getItemById(id);
      if(!item) {
        console.error('Item does not exist.');
        return;
      }

      this.store.dispatch(new AddBackpackItem(item));
    };
  }
}
