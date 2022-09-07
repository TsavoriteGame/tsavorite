import { Interaction, Descriptor, ItemInteraction, ItemConfig,
  ItemDescriptor, ReactionFunction, ReactionArgs, ItemPart, ReactionExtendedArgs } from './interfaces';

import * as Reactions from './reactions';

// reaction functions
export function getReaction(interaction: Interaction, descriptor: Descriptor): ReactionFunction {
  const defaultReaction: ReactionFunction = (args: ReactionArgs) => ({
    message: 'The items do not react.',
    success: false,
    newSource: args.sourceItem,
    newTarget: args.targetItem
  });

  const calledFunction: ReactionFunction = Reactions[interaction].applications[descriptor] || defaultReaction;

  // clone the items so we don't bleed anything out accidentally
  const passthroughFunction = (args: ReactionArgs) => {

    const extendedArgs: ReactionExtendedArgs = {
      sourceAction: args.sourceAction,
      sourceItem: structuredClone(args.sourceItem),
      targetItem: structuredClone(args.targetItem),

      sourcePart: undefined,
      targetPart: undefined
    };

    if(args.sourcePart) {
      const partIndex = args.sourceItem.parts.findIndex(p => p === args.sourcePart);
      extendedArgs.sourcePart = extendedArgs.sourceItem.parts[partIndex];
    } else {
      extendedArgs.sourcePart = extendedArgs.sourceItem.parts.find(x => x.foundational)
                             || extendedArgs.sourceItem.parts[0];
    }

    if(args.targetPart) {
      const partIndex = args.targetItem.parts.findIndex(p => p === args.targetPart);
      extendedArgs.targetPart = extendedArgs.targetItem.parts[partIndex];
    }

    return calledFunction(extendedArgs);
  };

  return passthroughFunction;
}

// interaction functions
export function getInteraction(item: ItemConfig, interaction: Interaction): ItemInteraction | undefined {
  if(item.interaction?.name !== interaction) return undefined;

  return item.interaction;
}

export function getInteractionLevel(item: ItemConfig, interaction: Interaction): number {
  return getInteraction(item, interaction)?.level ?? 0;
}

// descriptor functions
export function getDescriptor(item: ItemConfig, descriptor: Descriptor, minimum = 0): ItemDescriptor | undefined {
  const partWithDescriptor = item.parts.find(p => (p.descriptors[descriptor]?.level ?? 0) > minimum);
  return partWithDescriptor?.descriptors[descriptor];
}

export function getDescriptorLevel(item: ItemConfig, descriptor: Descriptor): number {
  return getDescriptor(item, descriptor)?.level ?? 0;
}

export function getDescriptorFromPart(part: ItemPart, descriptor: Descriptor): ItemDescriptor | undefined {
  return part.descriptors[descriptor];
}

export function getDescriptorLevelFromPart(part: ItemPart, descriptor: Descriptor): number {
  return getDescriptorFromPart(part, descriptor).level ?? 0;
}

export function getDescriptorLevelFromItemDescriptor(itemDescriptor: ItemDescriptor): number {
  return itemDescriptor?.level ?? 0;
}

export function isUnbreakable(item: ItemConfig): boolean {
  return getDescriptorLevel(item, Descriptor.Unbreakable) > 0;
}

export function isLocked(item: ItemConfig): boolean {
  return getDescriptorLevel(item, Descriptor.Locked) > 0;
}

// part functions
export function addPart(item: ItemConfig, part: ItemPart): void {
  item.parts.push(part);
}

export function removePart(item: ItemConfig, part: ItemPart): void {
  item.parts = item.parts.filter(p => p !== part);
}

export function increaseDescriptorLevelForPart(part: ItemPart, descriptor: Descriptor, levelDelta = 1): number {
  if(!part.descriptors[descriptor]) part.descriptors[descriptor] = { level: 0 };
  part.descriptors[descriptor].level += levelDelta;

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

// math functions
export function increaseInteractionLevel(item: ItemConfig, interaction: Interaction, delta = 1): number {
  const interactionData = getInteraction(item, interaction);
  const interactionLevel = getInteractionLevel(item, interaction);

  interactionData.level = Math.max(0, interactionLevel + delta);

  return interactionData.level;
}

export function decreaseInteractionLevel(item: ItemConfig, interaction: Interaction, delta = 1): number {
  return increaseInteractionLevel(item, interaction, -delta);
}

export function increaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, delta = 1): number {
  const descriptorData = getDescriptor(item, descriptor);
  const descriptorLevel = getDescriptorLevel(item, descriptor);

  descriptorData.level = Math.max(0, descriptorLevel + delta);

  return descriptorData.level;
}

export function decreaseDescriptorLevel(item: ItemConfig, descriptor: Descriptor, delta = 1): number {
  return increaseDescriptorLevel(item, descriptor, -delta);
}
