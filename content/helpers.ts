import { Interaction, Descriptor, ItemInteraction, ItemConfig, ItemDescriptor } from './interfaces';

// action functions
export function getInteraction(item: ItemConfig, action: Interaction): ItemInteraction | undefined {
  if(item.interaction?.name !== action) return undefined;

  return item.interaction;
}

export function getInteractionLevel(item: ItemConfig, action: Interaction): number {
  return getInteraction(item, action)?.level ?? 0;
}

// descriptor functions
export function getDescriptor(item: ItemConfig, descriptor: Descriptor): ItemDescriptor | undefined {
  const partWithDescriptor = item.parts.find(p => (p.descriptors[descriptor]?.level ?? 0) > 0);
  return partWithDescriptor?.descriptors[descriptor];
}

export function getDescriptorLevel(item: ItemConfig, descriptor: Descriptor): number {
  return getDescriptor(item, descriptor)?.level ?? 0;
}

export function isUnbreakable(item: ItemConfig): boolean {
  return getDescriptorLevel(item, Descriptor.Unbreakable) > 0;
}
