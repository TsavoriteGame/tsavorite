/* eslint-disable @typescript-eslint/no-use-before-define */

import { Interaction, Descriptor, ItemInteraction, ItemConfig,
  ItemDescriptor, ReactionFunction, ReactionArgs, ItemPart, ReactionExtendedArgs, ReactionResponse } from './interfaces';
import { getAllMiddleware, getPostMiddleware, getPreMiddleware } from './middleware';

import * as Reactions from './reactions';

// reaction functions
export function hasReaction(interaction: Interaction, descriptor: Descriptor): boolean {
  return !!Reactions[interaction].applications[descriptor];
}

export function getReaction(interaction: Interaction, descriptor: Descriptor): ReactionFunction {
  const defaultReaction: ReactionFunction = (args: ReactionArgs) => ({
    message: 'The items do not react.',
    success: false,
    newSource: args.sourceItem,
    newTarget: args.targetItem
  });

  const calledFunction: ReactionFunction = Reactions[interaction].applications[descriptor] || defaultReaction;

  // handle pre- and post- processing
  const passthroughFunction = (args: ReactionArgs) => {

    // clone items so we don't leak
    const extendedArgs: ReactionExtendedArgs = {
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
    const preMiddleware = getPreMiddleware(allMiddleware);

    let isPreBlocked = false;
    preMiddleware.forEach(middleware => {
      if(isPreBlocked) return;
      if(!middleware.isEnabled()) return;
      if(!middleware.shouldPreFire(extendedArgs)) return;

      middleware.pre(extendedArgs);

      if(middleware.shouldPreBlock(extendedArgs))
        isPreBlocked = true;

    });

    const result = calledFunction(extendedArgs);

    // run post- middleware
    const postMiddleware = getPostMiddleware(allMiddleware);

    let isPostBlocked = false;
    postMiddleware.forEach(middleware => {
      if(isPostBlocked) return;
      if(!middleware.isEnabled()) return;
      if(!middleware.shouldPostFire(extendedArgs, result)) return;

      middleware.post(extendedArgs, result);

      if(middleware.shouldPostBlock(extendedArgs, result))
        isPostBlocked = true;

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

export function getReactionForItem(interaction: Interaction, itemPart: ItemPart): ReactionFunction {
  return getReaction(interaction, itemPart.primaryDescriptor);
}

export function getReactionBetweenTwoItems(sourceItem: ItemConfig, targetItem: ItemConfig): ReactionResponse {
  const defaultReaction = () => ({
    success: false,
    message: 'The items did not react.',
    newSource: sourceItem,
    newTarget: targetItem,
    sourcePart: undefined,
    targetPart: undefined
  });

  const interaction = sourceItem.interaction;
  if(!interaction) return defaultReaction();

  const sourcePart = getPrimaryPartOfItem(sourceItem);
  if(!sourcePart) return defaultReaction();

  let targetPart: ItemPart;
  let validReaction: ReactionFunction;

  targetItem.parts.forEach(part => {
    if(targetPart || validReaction) return;
    if(!hasReaction(interaction.name, part.primaryDescriptor)) return;

    targetPart = part;
    validReaction = getReaction(interaction.name, targetPart.primaryDescriptor);
  });

  if(!targetPart) return defaultReaction();

  return validReaction({
    sourceItem,
    targetItem,
    sourcePart,
    targetPart
  });
}

export function getReactionBetweenItemAndPart(sourceItem: ItemConfig, targetItemPart: ItemPart): ReactionFunction | undefined {
  const interaction = sourceItem.interaction;
  if(!interaction) return undefined;

  return getReaction(interaction.name, targetItemPart.primaryDescriptor);
}

// interaction functions
export function setInteraction(item: ItemConfig, interaction: Interaction): void {
  if(!item.interaction) item.interaction = { name: interaction, level: 0 };

  item.interaction.name = interaction;
}

export function getInteraction(item: ItemConfig, interaction: Interaction): ItemInteraction | undefined {
  if(item.interaction?.name !== interaction) return undefined;

  return item.interaction;
}

export function getInteractionLevel(item: ItemConfig, interaction: Interaction): number {
  return getInteraction(item, interaction)?.level ?? 0;
}

// descriptor functions
export function getAllDescriptorsForPart(part: ItemPart): Descriptor[] {
  return Object.keys(part.descriptors).filter(d => part.descriptors[d].level > 0) as Descriptor[];
}

export function addDescriptor(item: ItemConfig, descriptor: Descriptor, level = 0): void {
  if(hasDescriptor(item, descriptor)) return;
  if(item.parts.length === 0) return;

  setDescriptorLevelForPart(item.parts[0], descriptor, level);
}

export function getDescriptor(item: ItemConfig, descriptor: Descriptor, minimum = 0): ItemDescriptor | undefined {
  const partWithDescriptor = item.parts.find(p => (p.descriptors[descriptor]?.level ?? 0) > minimum);
  return partWithDescriptor?.descriptors[descriptor];
}

export function getDescriptorLevel(item: ItemConfig, descriptor: Descriptor): number {
  return getDescriptor(item, descriptor)?.level ?? 0;
}

export function setDescriptorLevel(itemDescriptor: ItemDescriptor, level = 1): number {
  itemDescriptor.level = level;

  return itemDescriptor.level ?? 0;
}

export function getDescriptorFromPart(part: ItemPart, descriptor: Descriptor): ItemDescriptor | undefined {
  return part.descriptors[descriptor];
}

export function getDescriptorLevelFromPart(part: ItemPart, descriptor: Descriptor): number {
  return getDescriptorFromPart(part, descriptor)?.level ?? 0;
}

export function getDescriptorLevelFromItemDescriptor(itemDescriptor: ItemDescriptor): number {
  return itemDescriptor?.level ?? 0;
}

export function hasDescriptor(item: ItemConfig, descriptor: Descriptor): boolean {
  return getDescriptorLevel(item, descriptor) > 0;
}

export function changePrimaryDescriptor(itemPart: ItemPart, descriptor: Descriptor): void {
  itemPart.primaryDescriptor = descriptor;
}

export function getPartWithDescriptor(item: ItemConfig, descriptor: Descriptor): ItemPart | undefined {
  return item.parts.find(p => getDescriptorLevelFromPart(p, descriptor) > 0);
}

export function isUnbreakable(item: ItemConfig): boolean {
  return hasDescriptor(item, Descriptor.Unbreakable);
}

export function isLocked(item: ItemConfig): boolean {
  return hasDescriptor(item, Descriptor.Locked);
}

// part functions
export function hasFoundationalPart(item: ItemConfig): boolean {
  if(!item) return false;
  return !!item.parts.find(x => x.foundational);
}

export function setFoundationalPart(part: ItemPart): void {
  part.foundational = true;
}

export function addPart(item: ItemConfig, part: ItemPart): void {
  item.parts.push(part);
}

export function removePart(item: ItemConfig, part: ItemPart): void {
  item.parts = item.parts.filter(p => p !== part);
}

export function setDescriptorLevelForPart(part: ItemPart, descriptor: Descriptor, level = 1): number {
  part.descriptors[descriptor] = { level };

  return part.descriptors[descriptor].level ?? 0;
}

export function increaseDescriptorLevelForPart(part: ItemPart, descriptor: Descriptor, levelDelta = 1): number {
  if(!part.descriptors[descriptor]) part.descriptors[descriptor] = { level: 0 };
  part.descriptors[descriptor].level = Math.max(0, part.descriptors[descriptor].level + levelDelta);

  return part.descriptors[descriptor].level ?? 0;
}

export function decreaseDescriptorLevelForPart(part: ItemPart, descriptor: Descriptor, levelDelta = 1): number {
  return increaseDescriptorLevelForPart(part, descriptor, -levelDelta);
}

export function increasePartOrIncreaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, part: ItemPart, levelDelta = 1): void {
  const checkLevel = getDescriptorLevel(item, descriptor);
  if(checkLevel <= 0)
    addPart(item, part);
  else
    increaseDescriptorLevel(item, descriptor, levelDelta);
}

export function decreasePartOrIncreaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, part: ItemPart, levelDelta = 1): void {
  increasePartOrIncreaseDescriptorLevel(item, descriptor, part, -levelDelta);
}

export function getPrimaryPartOfItem(item: ItemConfig) {
  if(hasFoundationalPart(item)) return item.parts.find(p => p.foundational);

  return item.parts[0];
}

// other functions
export function increaseInteractionLevel(item: ItemConfig, interaction: Interaction, delta = 1): number {
  item.interaction = item.interaction || { name: interaction, level: 0 };

  if(item.interaction.name !== interaction) return 0;

  item.interaction.level = Math.max(0, item.interaction.level + delta);
  return item.interaction.level;
}

export function decreaseInteractionLevel(item: ItemConfig, interaction: Interaction, delta = 1): number {
  return increaseInteractionLevel(item, interaction, -delta);
}

export function increaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, delta = 1): number {
  let descriptorData = getDescriptor(item, descriptor, -1);
  let descriptorLevel = getDescriptorLevel(item, descriptor);

  if(!descriptorData || !descriptorLevel) addDescriptor(item, descriptor, 0);

  // in case they didnt exist before, we try to get them again
  descriptorData = getDescriptor(item, descriptor, -1);
  descriptorLevel = getDescriptorLevel(item, descriptor);

  descriptorData.level = Math.max(0, descriptorLevel + delta);

  return descriptorData.level;
}

export function decreaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, delta = 1): number {
  return increaseDescriptorLevel(item, descriptor, -delta);
}
