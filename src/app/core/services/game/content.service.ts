import { Injectable } from '@angular/core';

import { set } from 'lodash';
import { allArchetypes, allBackgrounds, allItems, allRecipes, getItemById } from '../../../../../content/getters';

import { IArchetype, IBackground, IItemConfig, IRecipe } from '../../../../../content/interfaces';
@Injectable({
  providedIn: 'root'
})
export class ContentService {

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

  constructor() { }

  // getters
  public getArchetype(name: string): IArchetype | undefined {
    return structuredClone(this.archetypes.find(x => x.name === name));
  }

  public getBackground(name: string): IBackground | undefined {
    return structuredClone(this.backgrounds.find(x => x.name === name));
  }

  public getItemById(itemId: string): IItemConfig | undefined {
    return getItemById(itemId);
  }

  public getRecipe(name: string): IRecipe | undefined {
    return structuredClone(this.recipes.find(x => x.name === name));
  }

  // formatters
  public reformatItem(itemId: string, modifications: Record<string, number>): IItemConfig {
    const realItem = this.getItemById(itemId);
    if(!realItem) return;

    // run the modifications through lodash.set for quick deep setting
    const workingItem = structuredClone(realItem);
    Object.keys(modifications || {}).forEach(mod => {
      set(workingItem, mod, modifications[mod]);
    });

    return workingItem;
  }
}
