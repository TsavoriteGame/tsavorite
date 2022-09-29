import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { set } from 'lodash';
import { allArchetypes, allBackgrounds, allItems, allRecipes, getItemById } from '../../../../../content/getters';

import { IArchetype, IBackground, IItemConfig, IRecipe } from '../../../../../content/interfaces';
import { SetCurrentCardId } from './actions';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private currentCardId = 0;

  public get archetypes(): IArchetype[] {
    return allArchetypes;
  }

  public get backgrounds(): IBackground[] {
    return allBackgrounds;
  }

  public get items(): IItemConfig[] {
    return allItems;
  }

  public get recipes(): IRecipe[] {
    return allRecipes;
  }

  constructor(private store: Store) { }

  // getters
  public getArchetype(name: string): IArchetype | undefined {
    return structuredClone(this.archetypes.find(x => x.name === name));
  }

  public getBackground(name: string): IBackground | undefined {
    return structuredClone(this.backgrounds.find(x => x.name === name));
  }

  public getItemById(itemId: string): IItemConfig | undefined {
    const item = structuredClone(getItemById(itemId));
    if(!item) {
      return undefined;
    }

    item.cardId = this.currentCardId;
    this.currentCardId++;

    this.store.dispatch(new SetCurrentCardId(this.currentCardId));

    return item;
  }

  public getRecipe(name: string): IRecipe | undefined {
    return structuredClone(this.recipes.find(x => x.name === name));
  }

  // formatters
  public setCurrentCardId(id: number): void {
    this.currentCardId = id;
  }

  public reformatItem(itemId: string, modifications: Record<string, number>): IItemConfig {
    const realItem = this.getItemById(itemId);
    if(!realItem) {
      return;
    }

    // run the modifications through lodash.set for quick deep setting
    const workingItem = structuredClone(realItem);
    Object.keys(modifications || {}).forEach(mod => {
      set(workingItem, mod, modifications[mod]);
    });

    return workingItem;
  }
}
