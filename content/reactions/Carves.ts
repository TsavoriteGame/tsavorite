import { getInteractionLevel,
  decreaseInteractionLevel, increaseDescriptorLevelForPart, getDescriptorFromPart, decreaseDescriptorLevelForPart } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

export const applications: Reactions = {

  // meaty things can be bled more, at the cost of meat levels
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const bleedsLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const meatLevel = getDescriptorFromPart(args.targetPart, Descriptor.Meat);

    if(bleedsLevel <= 0) {
      return {
        message: 'This item cannot bleed anything.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    if(meatLevel <= 0) {
      return {
        message: 'There is no meat to bleed.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    // lower the number of carves
    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    // make it more slippery because blood
    increaseDescriptorLevelForPart(args.sourcePart, Descriptor.Slippery, 1);
    increaseDescriptorLevelForPart(args.sourcePart, Descriptor.Bloody, 1);

    // lower the number of meat
    const newLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Meat, 1);

    // either add blood to the item, or make it bleed more
    increaseDescriptorLevelForPart(
      args.targetPart,
      Descriptor.Bloody,
      1
    );

    return {
      message: 'Bled the meat successfully.',
      success: true,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem
    };
  }

};
