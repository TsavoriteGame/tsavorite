import { getInteractionLevel, isUnbreakable, getDescriptor, getDescriptorLevelFromItemDescriptor } from '../helpers';
import { Descriptor, Reactions, ReactionArgs, Interaction } from '../interfaces';

export const applications: Reactions = {

  // locked things can be unlocked by an item that can do unlocks
  [Descriptor.Locked]: (args: ReactionArgs) => {

    const unlockLevel = getInteractionLevel(args.sourceItem, Interaction.Unlocks);

    const targetItem = args.targetItem;
    const lockedDescriptor = getDescriptor(targetItem, Descriptor.Locked);
    const lockedLevel = getDescriptorLevelFromItemDescriptor(lockedDescriptor);

    if(unlockLevel <= 0) {
      return {
        message: 'This item cannot unlock anything.',
        success: false,
        newSource: args.sourceItem,
        newTarget: targetItem
      };
    }

    if(lockedLevel <= 0) {
      return {
        message: 'There is no lock.',
        success: false,
        newSource: args.sourceItem,
        newTarget: targetItem
      };
    }

    if(unlockLevel >= lockedLevel) {
      const newItem = targetItem;
      newItem.parts = newItem.parts.filter(p => p.descriptors[Descriptor.Locked] !== lockedDescriptor);

      return {
        message: 'Unlocked the lock!',
        success: true,
        newSource: isUnbreakable(args.sourceItem) ? args.sourceItem : undefined,
        newTarget: newItem
      };
    }

    return {
      message: 'Lock is too complex for this key.',
      success: false,
      newSource: args.sourceItem,
      newTarget: targetItem
    };
  }

};
