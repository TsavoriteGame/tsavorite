
import { IArchetype, IBackground, IItemConfig, IMonsterConfig, IRecipe, IScenario, IWeaponAttack } from './interfaces';

import * as items from '../content/items/items.json';
import * as archetypes from '../content/archetypes/archetypes.json';
import * as backgrounds from '../content/backgrounds/backgrounds.json';
import * as recipes from '../content/recipes/recipes.json';
import * as scenarios from '../content/scenarios/scenarios.json';
import * as monsters from '../content/monsters/monsters.json';
import * as attacks from '../content/attacks/attacks.json';

const importedItems = (items as any).default || items;
const importedArchetypes = (archetypes as any).default || archetypes;
const importedBackgrounds = (backgrounds as any).default || backgrounds;
const importedRecipes = (recipes as any).default || recipes;
const importedScenarios = (scenarios as any).default || scenarios;
const importedMonsters = (monsters as any).default || monsters;
const importedAttacks = (attacks as any).default || attacks;

export const allItems = importedItems as IItemConfig[];
export const getItemById = (itemId: string): IItemConfig | undefined =>
  structuredClone(importedItems.find(x => x.id === itemId));

export const allArchetypes = importedArchetypes as IArchetype[];
export const getArchetypeByName = (name: string): IArchetype | undefined =>
  structuredClone(importedArchetypes.find(x => x.name === name));

export const allBackgrounds = importedBackgrounds as IBackground[];
export const getBackgroundByName = (name: string): IBackground | undefined =>
  structuredClone(importedBackgrounds.find(x => x.name === name));

export const allRecipes = importedRecipes as IRecipe[];
export const getRecipeByName = (name: string): IRecipe | undefined =>
  structuredClone(importedRecipes.find(x => x.name === name));

export const allScenarios = importedScenarios as IScenario[];
export const getScenarioByName = (name: string): IScenario | undefined =>
  structuredClone(importedScenarios.find(x => x.name === name));

export const allMonsters = importedMonsters as IMonsterConfig[];
export const getMonsterByName = (name: string): IMonsterConfig | undefined =>
  structuredClone(importedMonsters[name]);

export const allAttacks = importedAttacks as IWeaponAttack[];
export const getAttackByName = (name: string): IWeaponAttack | undefined =>
  structuredClone(importedAttacks[name]);
