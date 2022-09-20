import { Injectable } from '@angular/core';
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

  constructor(private store: Store, private contentService: ContentService) {
    this.initConsole();
  }

  public getConstant(constant: GameConstant) {
    return this.gameConstants[constant];
  }

  private initConsole() {
    (window as any).__addItem = (id: string) => {
      const item = this.contentService.getItem(id);
      if(!item) {
        console.error('Item does not exist.');
        return;
      }

      this.store.dispatch(new AddBackpackItem(item));
    };
  }
}
