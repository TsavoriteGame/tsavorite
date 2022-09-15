import { Interaction, Descriptor, ItemInteraction, ItemConfig,
  ItemDescriptor, ReactionFunction, ReactionArgs, ItemPart, ReactionExtendedArgs, ReactionResponse } from './interfaces';

import * as Reactions from './reactions';

// reaction functions
export function shouldItemBreakWhenInteractingWith(sourceItem: ItemConfig, targetItem: ItemConfig): boolean {

  if(!sourceItem || !targetItem) return false;

  const isSourceGlass = getDescriptorLevel(sourceItem, Descriptor.Glass) > 0;

  const isSourceWood = getDescriptorLevel(sourceItem, Descriptor.Wood) > 0;

  const isSourceRock = getDescriptorLevel(sourceItem, Descriptor.Rock) > 0;
  const isTargetRock = getDescriptorLevel(targetItem, Descriptor.Rock) > 0;

  const sourceMetalLevel = getDescriptorLevel(sourceItem, Descriptor.Metal);
  const targetMetalLevel = getDescriptorLevel(targetItem, Descriptor.Metal);

  const isSourceUnbreakable = isUnbreakable(sourceItem);
  const isTargetUnbreakable = isUnbreakable(targetItem);

  // unbreakable is never breakable
  if(isSourceUnbreakable) return false;

  // if they're unbreakable, we always break
  if(isTargetUnbreakable) return true;

  // glass always breaks
  if(isSourceGlass) return true;

  // if we're wood and they're rock or metal, break
  if(isSourceWood && (isTargetRock || targetMetalLevel > 0)) return true;

  // if we're rock and they're metal, break
  if(isSourceRock && targetMetalLevel > 0) return true;

  // if they have more metal than me, we break
  if(sourceMetalLevel > 0 && targetMetalLevel > 0 && sourceMetalLevel < targetMetalLevel) return true;

  // no situation above occurs, don't break
  return false;
}

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

    const result = calledFunction(extendedArgs);

    // always check if we should shatter an item
    const shouldItemShatter = result.newTarget && shouldShatter(result.newTarget);
    if(shouldItemShatter) {
      result.newTarget = undefined;
      result.message = `${result.message} Target shattered due to temperature!`;
    }

    // try to break items, they connected
    if(result.checkBreaks) {
      const shouldSourceBreak = shouldItemBreakWhenInteractingWith(result.newSource, result.newTarget);
      const shouldTargetBreak = shouldItemBreakWhenInteractingWith(result.newTarget, result.newSource);

      if(result.newSource && shouldSourceBreak) {
        result.newSource = undefined;
        result.message = `${result.message} Source was broken!`;
      }

      if(result.newTarget && shouldTargetBreak) {
        result.newTarget = undefined;
        result.message = `${result.message} Target was broken!`;
      }
    }

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

export function shouldShatter(item: ItemConfig) {
  const hasHot = hasDescriptor(item, Descriptor.Hot);
  const hasCold = hasDescriptor(item, Descriptor.Cold);
  const hasBlazing = hasDescriptor(item, Descriptor.Blazing);
  const hasFrozen = hasDescriptor(item, Descriptor.Frozen);
  const hasGlass = hasDescriptor(item, Descriptor.Glass);

  return (hasHot || hasBlazing) && (hasCold || hasFrozen) && hasGlass;
};

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

  setDescriptorLevelForPart(item.parts[0], descriptor, 0);
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

// math functions
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
