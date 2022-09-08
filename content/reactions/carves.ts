import { getInteractionLevel,
  decreaseInteractionLevel, increaseDescriptorLevelForPart,
  getDescriptorFromPart, decreaseDescriptorLevelForPart, getDescriptor,
  setDescriptorLevel, hasFoundationalPart,
  setDescriptorLevelForPart, hasDescriptor, setFoundationalPart, shouldItemBreakWhenInteractingWith } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot cut anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

export const applications: Reactions = {

  // fiber can be split into more fiber
  [Descriptor.Cooked]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const fiberLevel = getDescriptorFromPart(args.targetPart, Descriptor.Cooked);

    if(carvesLevel <= 0)  return zeroFail(args);

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

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const fiberLevel = getDescriptorFromPart(args.targetPart, Descriptor.Fiber);

    if(carvesLevel <= 0) return zeroFail(args);

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

  [Descriptor.Glass]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(shouldItemBreakWhenInteractingWith(sourceItem, targetItem)) {
      return {
        message: 'Can not carve into a stronger material.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasFoundationalPart(targetItem)) {
      return {
        message: 'Can not carve something with a foundational part.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasDescriptor(targetItem, Descriptor.Container)) {
      return {
        message: 'Can not create a container from a container.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    return {
      message: 'Can not create a container from a container.',
      success: true,
      checkBreaks: false,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },

  [Descriptor.Leather]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(shouldItemBreakWhenInteractingWith(sourceItem, targetItem)) {
      return {
        message: 'Can not carve into a stronger material.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasFoundationalPart(targetItem)) {
      return {
        message: 'Can not carve something with a foundational part.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasDescriptor(targetItem, Descriptor.Container)) {
      return {
        message: 'Can not create a container from a container.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    return {
      message: 'Can not create a container from a container.',
      success: true,
      checkBreaks: false,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },

  // meaty things can be bled more, at the cost of meat levels
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const meatLevel = getDescriptorFromPart(args.targetPart, Descriptor.Meat);

    if(carvesLevel <= 0) return zeroFail(args);

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

  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(shouldItemBreakWhenInteractingWith(sourceItem, targetItem)) {
      return {
        message: 'Can not carve into a stronger material.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasFoundationalPart(targetItem)) {
      return {
        message: 'Can not carve something with a foundational part.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasDescriptor(targetItem, Descriptor.Container)) {
      return {
        message: 'Can not create a container from a container.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    return {
      message: 'Can not create a container from a container.',
      success: true,
      checkBreaks: false,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },

  [Descriptor.Rock]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(shouldItemBreakWhenInteractingWith(sourceItem, targetItem)) {
      return {
        message: 'Can not carve into a stronger material.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasFoundationalPart(targetItem)) {
      return {
        message: 'Can not carve something with a foundational part.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasDescriptor(targetItem, Descriptor.Container)) {
      return {
        message: 'Can not create a container from a container.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    return {
      message: 'Can not create a container from a container.',
      success: true,
      checkBreaks: false,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },

  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(shouldItemBreakWhenInteractingWith(sourceItem, targetItem)) {
      return {
        message: 'Can not carve into a stronger material.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasFoundationalPart(targetItem)) {
      return {
        message: 'Can not carve something with a foundational part.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    if(hasDescriptor(targetItem, Descriptor.Container)) {
      return {
        message: 'Can not create a container from a container.',
        success: false,
        checkBreaks: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    const newCarvesLevel = decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    return {
      message: 'Can not create a container from a container.',
      success: true,
      checkBreaks: false,
      newSource: newCarvesLevel <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },

};
