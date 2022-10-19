/* eslint-disable @typescript-eslint/no-use-before-define */

import { Interaction, Descriptor, IItemInteraction, IItemConfig,
  IItemDescriptor, ReactionFunction, IReactionArgs, IItemPart, IReactionExtendedArgs, IReactionResponse,
  IRecipe } from './interfaces';
import { getAllMiddleware, getPostCombineMiddleware,
  getPostReactionMiddleware, getPreCombineMiddleware, getPreReactionMiddleware } from './middleware';

import { sortBy, sumBy, maxBy } from 'lodash';

import * as Reactions from './reactions';
import allRecipes from './data/recipes/recipes.json';

// reaction functions
export function hasReaction(interaction: Interaction, descriptor: Descriptor): boolean {
  return !!Reactions[interaction]?.applications[descriptor];
}

export function getReaction(interaction: Interaction, descriptor: Descriptor): ReactionFunction {
  const defaultReaction: ReactionFunction = (args: IReactionArgs) => ({
    message: 'The items do not react.',
    success: false,
    newSource: args.sourceItem,
    newTarget: args.targetItem,
    extraItems: []
  });

  const calledFunction: ReactionFunction = Reactions[interaction].applications[descriptor] || defaultReaction;

  // handle pre- and post- processing
  const passthroughFunction = (args: IReactionArgs) => {

    // clone items so we don't leak
    const extendedArgs: IReactionExtendedArgs = {
      sourceItem: structuredClone(args.sourceItem),
      targetItem: structuredClone(args.targetItem),

      sourcePart: undefined,
      targetPart: undefined
    };

    const allMiddleware = getAllMiddleware();

    const doesSourceHaveFoundationalPart = hasFoundationalPart(extendedArgs.sourceItem);
    const doesTargetHaveFoundationalPart = hasFoundationalPart(extendedArgs.targetItem);

    // get the source part if not specified
    if(args.sourcePart) {
      const partIndex = args.sourceItem.parts.findIndex(p => p === args.sourcePart);
      extendedArgs.sourcePart = extendedArgs.sourceItem.parts[partIndex];
    } else {
      extendedArgs.sourcePart = extendedArgs.sourceItem.parts.find(x => x.foundational)
                             || extendedArgs.sourceItem.parts[0];
    }


    // get the target part if not specified
    if(args.targetPart) {
      const partIndex = args.targetItem.parts.findIndex(p => p === args.targetPart);
      extendedArgs.targetPart = extendedArgs.targetItem.parts[partIndex];
    }

    // run pre- middleware
    const preMiddleware = getPreReactionMiddleware(allMiddleware);

    let isPreBlocked = false;
    preMiddleware.forEach(middleware => {
      if(isPreBlocked) {
        return;
      }
      if(!middleware.isEnabled()) {
        return;
      }
      if(!middleware.shouldPreFire(extendedArgs)) {
        return;
      }

      middleware.pre(extendedArgs);

      if(middleware.shouldPreBlock(extendedArgs)) {
        isPreBlocked = true;
      }

    });

    const result = calledFunction(extendedArgs);

    // run post- middleware
    const postMiddleware = getPostReactionMiddleware(allMiddleware);

    let isPostBlocked = false;
    postMiddleware.forEach(middleware => {
      if(isPostBlocked) {
        return;
      }
      if(!middleware.isEnabled()) {
        return;
      }
      if(!middleware.shouldPostFire(extendedArgs, result)) {
        return;
      }

      middleware.post(extendedArgs, result);

      if(middleware.shouldPostBlock(extendedArgs, result)) {
        isPostBlocked = true;
      }

    });

    if(doesSourceHaveFoundationalPart && !hasFoundationalPart(result.newSource)) {
      result.newSource = undefined;
      result.message = `${result.message} Source fell apart!`;
    }

    if(doesTargetHaveFoundationalPart && !hasFoundationalPart(result.newTarget)) {
      result.newTarget = undefined;
      result.message = `${result.message} Source fell apart!`;
    }

    return result;
  };

  return passthroughFunction;
}

export function getReactionForItem(interaction: Interaction, itemPart: IItemPart): ReactionFunction {
  return getReaction(interaction, itemPart.primaryDescriptor);
}

export function getReactionBetweenTwoItems(sourceItem: IItemConfig, targetItem: IItemConfig): IReactionResponse {
  const defaultReaction = () => ({
    success: false,
    message: 'The items did not react.',
    newSource: sourceItem,
    newTarget: targetItem,
    sourcePart: undefined,
    targetPart: undefined,
    extraItems: []
  });

  const interaction = sourceItem.interaction;
  if(!interaction) {
    return defaultReaction();
  }

  const sourcePart = getPrimaryPartOfItem(sourceItem);
  if(!sourcePart) {
    return defaultReaction();
  }

  let targetPart: IItemPart;
  let validReaction: ReactionFunction;

  targetItem.parts.forEach(part => {
    if(targetPart || validReaction) {
      return;
    }
    if(!hasReaction(interaction.name, part.primaryDescriptor)) {
      return;
    }

    targetPart = part;
    validReaction = getReaction(interaction.name, targetPart.primaryDescriptor);
  });

  if(!targetPart) {
    return defaultReaction();
  }

  return validReaction({
    sourceItem,
    targetItem,
    sourcePart,
    targetPart
  });
}

export function getReactionBetweenItemAndPart(sourceItem: IItemConfig, targetItemPart: IItemPart): ReactionFunction | undefined {
  const interaction = sourceItem.interaction;
  if(!interaction) {
    return undefined;
  }

  return getReaction(interaction.name, targetItemPart.primaryDescriptor);
}

// interaction functions
export function setInteraction(item: IItemConfig, interaction: Interaction): void {
  if(!item.interaction) {
    item.interaction = { name: interaction, level: 0 };
  }

  item.interaction.name = interaction;
}

export function getInteraction(item: IItemConfig, interaction: Interaction): IItemInteraction | undefined {
  if(item.interaction?.name !== interaction) {
    return undefined;
  }

  return item.interaction;
}

export function getInteractionLevel(item: IItemConfig, interaction: Interaction): number {
  return getInteraction(item, interaction)?.level ?? 0;
}

// descriptor functions
export function getAllDescriptorsForPart(part: IItemPart): Descriptor[] {
  return Object.keys(part.descriptors).filter(d => part.descriptors[d].level > 0) as Descriptor[];
}

export function getAllDescriptorsForItem(item: IItemConfig): Descriptor[] {
  return [...new Set(
    (item.parts || [])
      .map(part => getAllDescriptorsForPart(part))
      .flat()
  )] as Descriptor[];
}

export function addDescriptor(item: IItemConfig, descriptor: Descriptor, level = 0): void {
  if(hasDescriptor(item, descriptor)) {
    return;
  }

  if(item.parts.length === 0) {
    return;
  }

  setDescriptorLevelForPart(item.parts[0], descriptor, level);
}

export function getDescriptor(item: IItemConfig, descriptor: Descriptor, minimum = 0): IItemDescriptor | undefined {
  if(!item.parts) {
    return undefined;
  }

  const partWithDescriptor = item.parts.find(p => (p.descriptors[descriptor]?.level ?? 0) > minimum);
  return partWithDescriptor?.descriptors[descriptor];
}

export function getHighestDescriptorByLevel(item: IItemConfig): Descriptor | undefined {
  return maxBy(
    getAllDescriptorsForItem(item)
      .map(descriptor => ({ descriptor, level: getTotalDescriptorLevel(item, descriptor) })),
    'level'
  )?.descriptor;
}

export function getDescriptorLevel(item: IItemConfig, descriptor: Descriptor): number {
  return getDescriptor(item, descriptor)?.level ?? 0;
}

export function getTotalDescriptorLevel(item: IItemConfig, descriptor: Descriptor): number {
  return item.parts.reduce((total, part) => total + (part.descriptors[descriptor]?.level ?? 0), 0);
}

export function setDescriptorLevel(itemDescriptor: IItemDescriptor, level = 1): number {
  itemDescriptor.level = level;

  return itemDescriptor.level ?? 0;
}

export function getDescriptorFromPart(part: IItemPart, descriptor: Descriptor): IItemDescriptor | undefined {
  return part.descriptors[descriptor];
}

export function getDescriptorLevelFromPart(part: IItemPart, descriptor: Descriptor): number {
  return getDescriptorFromPart(part, descriptor)?.level ?? 0;
}

export function getDescriptorLevelFromItemDescriptor(itemDescriptor: IItemDescriptor): number {
  return itemDescriptor?.level ?? 0;
}

export function hasDescriptor(item: IItemConfig, descriptor: Descriptor): boolean {
  return getDescriptorLevel(item, descriptor) > 0;
}

export function changePrimaryDescriptor(itemPart: IItemPart, descriptor: Descriptor): void {
  itemPart.primaryDescriptor = descriptor;
}

export function getPartWithDescriptor(item: IItemConfig, descriptor: Descriptor, minimum = 0): IItemPart | undefined {
  return item.parts.find(p => getDescriptorLevelFromPart(p, descriptor) > minimum);
}

export function isUnbreakable(item: IItemConfig): boolean {
  return hasDescriptor(item, Descriptor.Unbreakable);
}

export function isLocked(item: IItemConfig): boolean {
  return hasDescriptor(item, Descriptor.Locked);
}

export function isFunctional(item: IItemConfig): boolean {
  if(!item) {
    return false;
  }

  const descriptor = getHighestDescriptorByLevel(item);
  if(!descriptor) {
    return false;
  }

  return getDescriptorLevel(item, descriptor) > 0;
}

// part functions
export function hasFoundationalPart(item: IItemConfig): boolean {
  if(!item) {
    return false;
  }
  return !!item.parts.find(x => x.foundational);
}

export function setFoundationalPart(part: IItemPart): void {
  part.foundational = true;
}

export function addPart(item: IItemConfig, part: IItemPart): void {
  item.parts.push(part);
}

export function removePart(item: IItemConfig, part: IItemPart): void {
  item.parts = item.parts.filter(p => p !== part);
}

export function setDescriptorLevelForPart(part: IItemPart, descriptor: Descriptor, level = 1): number {
  part.descriptors[descriptor] = { level };

  return part.descriptors[descriptor].level ?? 0;
}

export function increaseDescriptorLevelForPart(part: IItemPart, descriptor: Descriptor, levelDelta = 1): number {
  if(!part.descriptors[descriptor]) {
    part.descriptors[descriptor] = { level: 0 };
  }
  part.descriptors[descriptor].level = Math.max(0, part.descriptors[descriptor].level + levelDelta);

  return part.descriptors[descriptor].level ?? 0;
}

export function decreaseDescriptorLevelForPart(part: IItemPart, descriptor: Descriptor, levelDelta = 1): number {
  return increaseDescriptorLevelForPart(part, descriptor, -levelDelta);
}

export function increasePartOrIncreaseDescriptorLevel(item: IItemConfig, descriptor: Descriptor, part: IItemPart, levelDelta = 1): void {
  const checkLevel = getDescriptorLevel(item, descriptor);
  if(checkLevel <= 0) {
    addPart(item, part);
  } else {
    increaseDescriptorLevel(item, descriptor, levelDelta);
  }
}

export function decreasePartOrIncreaseDescriptorLevel(item: IItemConfig, descriptor: Descriptor, part: IItemPart, levelDelta = 1): void {
  increasePartOrIncreaseDescriptorLevel(item, descriptor, part, -levelDelta);
}

export function getPrimaryPartOfItem(item: IItemConfig) {
  if(hasFoundationalPart(item)) {
    return item.parts.find(p => p.foundational);
  }

  return item.parts[0];
}

export function hasSharedPrimaryDescriptor(sourceItem: IItemConfig, targetItem: IItemConfig): boolean {
  const sourcePart = getPrimaryPartOfItem(sourceItem);
  const targetPart = getPrimaryPartOfItem(targetItem);

  return sourcePart.primaryDescriptor === targetPart.primaryDescriptor;
}

export function balanceOppositeDescriptors(item: IItemConfig, a: Descriptor, b: Descriptor) {
  while (getDescriptorLevel(item, a) > 0 && getDescriptorLevel(item, b) > 0) {
    decreaseDescriptorLevel(item, a, 1);
    decreaseDescriptorLevel(item, b, 1);
  }
}

// combination functions
export function getCombinationBetweenTwoItems(sourceItem: IItemConfig, targetItem: IItemConfig): IReactionResponse {
  const failedCombination = () => ({
    success: false,
    message: 'The items were not combined.',
    newSource: sourceItem,
    newTarget: targetItem,
    extraItems: []
  });

  if (hasFoundationalPart(sourceItem) || sourceItem.parts.length > 1
   || hasFoundationalPart(targetItem) || targetItem.parts.length > 1) {
    return failedCombination();
  }

  const extendedArgs: IReactionExtendedArgs = {
    sourceItem: structuredClone(sourceItem),
    targetItem: structuredClone(targetItem),

    sourcePart: undefined,
    targetPart: undefined
  };

  extendedArgs.sourcePart = extendedArgs.sourceItem.parts[0];
  extendedArgs.targetPart = extendedArgs.targetItem.parts[0];

  const interaction = extendedArgs.sourceItem.interaction;
  if (interaction && hasReaction(interaction.name, extendedArgs.targetPart.primaryDescriptor)) {
    return failedCombination();
  }

  if (!hasSharedPrimaryDescriptor(extendedArgs.sourceItem, extendedArgs.targetItem)) {
    return failedCombination();
  }

  const allMiddleware = getAllMiddleware();

  // run pre- middleware
  const preMiddleware = getPreCombineMiddleware(allMiddleware);

  let isPreBlocked = false;
  preMiddleware.forEach(middleware => {
    if(isPreBlocked) {
      return;
    }
    if(!middleware.isEnabled()) {
      return;
    }
    if(!middleware.shouldPreFire(extendedArgs)) {
      return;
    }

    middleware.pre(extendedArgs);

    if(middleware.shouldPreBlock(extendedArgs)) {
      isPreBlocked = true;
    }

  });

  // combine the items
  Object.keys(extendedArgs.sourcePart.descriptors || {}).forEach(
    desc => increaseDescriptorLevelForPart(
      extendedArgs.targetPart,
      desc as Descriptor,
      extendedArgs.sourcePart.descriptors[desc].level ?? 0
    )
  );

  const result = {
    success: true,
    message: 'The items were combined.',
    newSource: undefined,
    newTarget: extendedArgs.targetItem,
    extraItems: []
  };

  // run post- middleware
  const postMiddleware = getPostCombineMiddleware(allMiddleware);

  let isPostBlocked = false;
  postMiddleware.forEach(middleware => {
    if(isPostBlocked) {
      return;
    }
    if(!middleware.isEnabled()) {
      return;
    }
    if(!middleware.shouldPostFire(extendedArgs, result)) {
      return;
    }

    middleware.post(extendedArgs, result);

    if(middleware.shouldPostBlock(extendedArgs, result)) {
      isPostBlocked = true;
    }

  });

  return result;
}

// recipe functions
export function getAllRecipesForInteraction(interaction: Interaction): IRecipe[] {
  let recipes: IRecipe[] = (allRecipes as IRecipe[]).filter(recipe => recipe.interaction === interaction);

  recipes = sortBy(recipes, recipe => -sumBy(recipe.ingredients.map(i => i.level)));

  return recipes;
}

export function getAllFulfilledRecipesForItem(item: IItemConfig): IRecipe[] | undefined {
  if (!item.interaction) {
    return undefined;
  }

  const recipes: IRecipe[] = getAllRecipesForInteraction(item.interaction.name).filter(recipe => {
    if (!recipe.ingredients) {
      return false;
    }

    let fulfilled = true;
    recipe.ingredients.forEach(ingredient => {
      if (!fulfilled) {
        return;
      }

      fulfilled = (ingredient.level <= getDescriptorLevel(item, ingredient.descriptor));
    });

    return fulfilled;
  });

  if (recipes.length === 0) {
    return undefined;
  }

  return recipes;
}

export function getValidFulfilledRecipeForItem(item: IItemConfig): IRecipe | undefined {
  if (!item.interaction) {
    return undefined;
  }

  const fulfilledRecipes = getAllFulfilledRecipesForItem(item);
  if (fulfilledRecipes === undefined || fulfilledRecipes.length <= 0) {
    return undefined;
  }

  return fulfilledRecipes[0];
}

// other functions
export function increaseInteractionLevel(item: IItemConfig, interaction: Interaction, delta = 1): number {
  item.interaction = item.interaction || { name: interaction, level: 0 };

  if(item.interaction.name !== interaction) {
    return 0;
  }

  item.interaction.level = Math.max(0, item.interaction.level + delta);
  return item.interaction.level;
}

export function decreaseInteractionLevel(item: IItemConfig, interaction: Interaction, delta = 1): number {
  return increaseInteractionLevel(item, interaction, -delta);
}

export function increaseDescriptorLevel(item: IItemConfig, descriptor: Descriptor, delta = 1): number {
  let part = getPartWithDescriptor(item, descriptor, 0);
  if(!part) {
    addDescriptor(item, descriptor, 0);
    part = getPartWithDescriptor(item, descriptor, -1);
  }

  const newLevel = increaseDescriptorLevelForPart(part, descriptor, delta);
  return newLevel;
}

export function decreaseDescriptorLevel(item: IItemConfig, descriptor: Descriptor, delta = 1): number {
  return increaseDescriptorLevel(item, descriptor, -delta);
}
