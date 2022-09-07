import { getInteractionLevel, getDescriptorLevel, reduceDescriptorLevel,
  increaseDescriptorLevel, addPart, reduceInteractionLevel } from '../helpers';
import { Descriptor, Reactions, ReactionArgs, Interaction } from '../interfaces';

export const applications: Reactions = {

  // meaty things can be bled more, at the cost of meat levels
  [Descriptor.Meat]: (args: ReactionArgs) => {

    const bleedsLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const meatLevel = getDescriptorLevel(targetItem, Descriptor.Meat);

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
    const newCarvesLevel = reduceInteractionLevel(sourceItem, Interaction.Carves, 1);

    // lower the number of meat
    const newLevel = reduceDescriptorLevel(targetItem, Descriptor.Meat, 1);

    // either add blood to the item, or make it bleed more
    const bloodyLevel = getDescriptorLevel(targetItem, Descriptor.Bloody);
    if(bloodyLevel <= 0)
      addPart(targetItem, { name: 'Blood', descriptors: { [Descriptor.Bloody]: { level: 1 } } });
     else
      increaseDescriptorLevel(targetItem, Descriptor.Bloody, 1);

    return {
      message: 'Bled the meat successfully.',
      success: true,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem
    };
  }

};
