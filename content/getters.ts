
import { Archetype, Background, ItemConfig } from './interfaces';

import * as items from '../content/items/items.json';
import * as archetypes from '../content/archetypes/archetypes.json';
import * as backgrounds from '../content/backgrounds/backgrounds.json';

const importedItems = (items as any).default || items;
const importedArchetypes = (archetypes as any).default || archetypes;
const importedBackgrounds = (backgrounds as any).default || backgrounds;

export const allItems = importedItems as ItemConfig[];
export const getItemById = (itemId: string): ItemConfig | undefined => importedItems.find(x => x.id === itemId);

export const allArchetypes = importedArchetypes as Archetype[];
export const getArchetypeByName = (name: string): Archetype | undefined => importedArchetypes.find(x => x.name === name);

export const allBackgrounds = importedBackgrounds as Background[];
export const getBackgroundByName = (name: string): Background | undefined => importedBackgrounds.find(x => x.name === name);
