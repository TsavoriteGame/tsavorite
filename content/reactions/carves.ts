import { getInteractionLevel,
  decreaseInteractionLevel, increaseDescriptorLevelForPart,
  getDescriptorFromPart, decreaseDescriptorLevelForPart, getDescriptor, setDescriptorLevel, getDescriptorLevel } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs, ItemConfig } from '../interfaces';

export const applications: Reactions = {

  // fiber can be split into more fiber
  [Descriptor.Cooked]: (args: ReactionExtendedArgs) => {

    const bleedsLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const fiberLevel = getDescriptorFromPart(args.targetPart, Descriptor.Cooked);

    if(bleedsLevel <= 0) {
      return {
        message: 'This item cannot cut anything.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    if(fiberLevel <= 1) {
      return {
        message: 'There is not enough food here to cut.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    // lower the number of carves
    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    // copy the item pre-cut
    const itemCopy = structuredClone(args.targetItem);
    const copyDescriptor = getDescriptor(itemCopy, Descriptor.Cooked);
    setDescriptorLevel(copyDescriptor, 1);

    // lower the number of cooked
    const newLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Cooked, 1);

    return {
      message: 'Cut the food successfully.',
      success: true,
      checkBreaks: true,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem,
      extraItems: [itemCopy]
    };
  },

  // fiber can be split into more fiber
  [Descriptor.Fiber]: (args: ReactionExtendedArgs) => {

    const bleedsLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const fiberLevel = getDescriptorFromPart(args.targetPart, Descriptor.Fiber);

    if(bleedsLevel <= 0) {
      return {
        message: 'This item cannot cut anything.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    if(fiberLevel <= 1) {
      return {
        message: 'There is not enough fiber here to cut.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    // lower the number of carves
    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    // copy the item pre-cut
    const itemCopy = structuredClone(args.targetItem);
    const copyDescriptor = getDescriptor(itemCopy, Descriptor.Fiber);
    setDescriptorLevel(copyDescriptor, 1);

    // lower the number of fiber
    const newLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Fiber, 1);

    return {
      message: 'Cut the fiber successfully.',
      success: true,
      checkBreaks: true,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem,
      extraItems: [itemCopy]
    };
  },

  // meaty things can be bled more, at the cost of meat levels
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const bleedsLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const meatLevel = getDescriptorFromPart(args.targetPart, Descriptor.Meat);

    if(bleedsLevel <= 0) {
      return {
        message: 'This item cannot cut anything.',
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
      message: 'Cut the meat successfully.',
      success: true,
      checkBreaks: true,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem
    };
  },

};
