import { Injectable } from '@angular/core';

import { set } from 'lodash';

import { Archetype, Background, ItemConfig } from '../../../../../content/interfaces';

import * as items from '../../../../../content/items/items.json';
import * as archetypes from '../../../../../content/archetypes/archetypes.json';
import * as backgrounds from '../../../../../content/backgrounds/backgrounds.json';

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  public get archetypes(): Archetype[] {
    return (archetypes as any).default || archetypes;
  }

  public get backgrounds(): Background[] {
    return (backgrounds as any).default || backgrounds;
  }

  public get items(): ItemConfig[] {
    return (items as any).default || items;
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
    return structuredClone(this.items.find(x => x.id === itemId));
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
