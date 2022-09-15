import { getInteractionLevel, increaseDescriptorLevelForPart, decreaseInteractionLevel, getDescriptorLevelFromPart } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot zap anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

export const applications: Reactions = {

  // metal can be magnetized
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {

    const zapsLevel = getInteractionLevel(args.sourceItem, Interaction.Zaps);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const magneticLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Magnetic);

    if(zapsLevel <= 0) return zeroFail(args);

    if(magneticLevel > 0) return zeroFail(args);

    if(magneticLevel >= zapsLevel) return zeroFail(args);

    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Magnetic);

    return {
      message: 'Magnetized the metal.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // wet things can be electrified
  [Descriptor.Wet]: (args: ReactionExtendedArgs) => {

    const zapsLevel = getInteractionLevel(args.sourceItem, Interaction.Zaps);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(zapsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Zaps);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Electric);

    return {
      message: 'Shocked the current.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },
};
