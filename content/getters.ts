
import { Archetype, Background, ItemConfig, Recipe, Scenario } from './interfaces';

import * as items from '../content/items/items.json';
import * as archetypes from '../content/archetypes/archetypes.json';
import * as backgrounds from '../content/backgrounds/backgrounds.json';
import * as recipes from '../content/recipes/recipes.json';
import * as scenarios from '../content/scenarios/scenarios.json';

const importedItems = (items as any).default || items;
const importedArchetypes = (archetypes as any).default || archetypes;
const importedBackgrounds = (backgrounds as any).default || backgrounds;
const importedRecipes = (recipes as any).default || recipes;
const importedScenarios = (scenarios as any).default || scenarios;

export const allItems = importedItems as ItemConfig[];
export const getItemById = (itemId: string): ItemConfig | undefined => importedItems.find(x => x.id === itemId);

export const allArchetypes = importedArchetypes as Archetype[];
export const getArchetypeByName = (name: string): Archetype | undefined => importedArchetypes.find(x => x.name === name);

export const allBackgrounds = importedBackgrounds as Background[];
export const getBackgroundByName = (name: string): Background | undefined => importedBackgrounds.find(x => x.name === name);

export const allRecipes = importedRecipes as Recipe[];
export const getRecipeByName = (name: string): Recipe | undefined => importedRecipes.find(x => x.name === name);

export const allScenarios = importedScenarios as Scenario[];
export const getScenarioByName = (name: string): Scenario | undefined => importedScenarios.find(x => x.name === name);
