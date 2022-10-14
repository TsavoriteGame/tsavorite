import { getInteractionLevel, isUnbreakable, getDescriptorLevelFromItemDescriptor, getDescriptorFromPart, removePart } from '../helpers';
import { Descriptor, Reactions, Interaction, IReactionExtendedArgs } from '../interfaces';

export const applications: Reactions = {

  // locked things can be unlocked by an item that can do unlocks
  [Descriptor.Locked]: (args: IReactionExtendedArgs) => {

    const unlockLevel = getInteractionLevel(args.sourceItem, Interaction.Unlocks);

    const targetItem = args.targetItem;
    const lockedDescriptor = getDescriptorFromPart(args.targetPart, Descriptor.Locked);
    const lockedLevel = getDescriptorLevelFromItemDescriptor(lockedDescriptor);

    if(unlockLevel <= 0) {
      return {
        message: 'This item cannot unlock anything.',
        success: false,
        newSource: args.sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }


    if(lockedLevel <= 0) {
      return {
        message: 'There is no lock.',
        success: false,
        newSource: args.sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }


    if(unlockLevel >= lockedLevel) {
      removePart(targetItem, args.targetPart);

      return {
        message: 'Unlocked the lock!',
        success: true,
        newSource: isUnbreakable(args.sourceItem) ? args.sourceItem : undefined,
        newTarget: targetItem,
        extraItems: []
      };
    }

    return {
      message: 'Lock is too complex for this key.',
      success: false,
      newSource: args.sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  }

};
