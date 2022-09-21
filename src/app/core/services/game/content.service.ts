import { Injectable } from '@angular/core';

import { set } from 'lodash';
import { allArchetypes, allBackgrounds, allItems, getItemById } from '../../../../../content/getters';

import { Archetype, Background, ItemConfig } from '../../../../../content/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  public get archetypes(): Archetype[] {
    return allArchetypes;
  }

  public get backgrounds(): Background[] {
    return allBackgrounds;
  }

  public get items(): ItemConfig[] {
    return allItems;
  }

  constructor() { }

  // getters
  public getArchetype(name: string): Archetype | undefined {
    return structuredClone(this.archetypes.find(x => x.name === name));
  }

  public getBackground(name: string): Background | undefined {
    return structuredClone(this.backgrounds.find(x => x.name === name));
  }

  public getItemById(itemId: string): ItemConfig | undefined {
    return getItemById(itemId);
  }

  // formatters
  public reformatItem(itemId: string, modifications: Record<string, number>): ItemConfig {
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
