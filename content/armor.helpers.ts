import { getPrimaryPartOfItem, hasDescriptor } from './helpers';
import { Descriptor, IItemConfig } from './interfaces';

export const calculateDamageReductionFromItem = (item: IItemConfig): number => {

  // only armor provides DR
  if(!hasDescriptor(item, Descriptor.FeetArmor)
  && !hasDescriptor(item, Descriptor.BodyArmor)
  && !hasDescriptor(item, Descriptor.HeadArmor)) {
    return 0;
  }

  const damageReductionForModifier: Partial<Record<Descriptor, number>> = {
    [Descriptor.Clay]: 1,
    [Descriptor.Fiber]: 1,
    [Descriptor.Meat]: 1,
    [Descriptor.Glass]: 1,
    [Descriptor.Leather]: 2,
    [Descriptor.Rock]: 2,
    [Descriptor.Metal]: 3,
    [Descriptor.Wood]: 2
  };

  const primaryPart = getPrimaryPartOfItem(item);
  return damageReductionForModifier[primaryPart.primaryDescriptor] ?? 0;
};
