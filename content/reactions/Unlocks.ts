import { getInteractionLevel, getDescriptorLevel, isUnbreakable } from '../helpers';
import { Descriptor, Reactions, ReactionArgs, Interaction } from '../interfaces';

export const applications: Reactions = {

  [Descriptor.Locked]: (args: ReactionArgs) => {

    const unlockLevel = getInteractionLevel(args.sourceItem, Interaction.Unlocks);

    const targetItem = args.targetItem;
    const lockedLevel = getDescriptorLevel(targetItem, Descriptor.Locked);

    if(lockedLevel <= 0) {
      return {
        message: 'There is no lock.',
        success: true,
        consumeSource: false,
        consumeTarget: false
      };
    }

    if(unlockLevel >= lockedLevel) {
      return {
        message: 'Unlocked the lock!',
        success: true,
        consumeSource: !isUnbreakable(args.sourceItem),
        consumeTarget: true
      };
    }

    return {
      message: 'Lock is too complex for this key.',
      success: false,
      consumeSource: false,
      consumeTarget: false
    };
  }

};
