import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { AddBackpackItem } from './actions';
import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private store: Store, private contentService: ContentService) {
    this.initConsole();
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
