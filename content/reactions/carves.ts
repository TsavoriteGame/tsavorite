import { getItemById } from '../getters';
import { getInteractionLevel,
  decreaseInteractionLevel, increaseDescriptorLevelForPart,
  decreaseDescriptorLevelForPart, getDescriptor,
  setDescriptorLevel, hasFoundationalPart,
  setDescriptorLevelForPart, hasDescriptor, setFoundationalPart,
  getDescriptorLevelFromPart, getAllDescriptorsForPart } from '../helpers';
import { Descriptor, Reactions, Interaction, IReactionExtendedArgs } from '../interfaces';
import { shouldItemBreakWhenInteractingWith } from '../middleware/break-items';

const zeroFail = (args: IReactionExtendedArgs) => ({
  message: 'This item cannot cut anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

export const applications: Reactions = {

  [Descriptor.Clay]: (args: IReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    if(carvesLevel <= 0) return zeroFail(args);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    const clayBowl = getItemById('ClayBowl-1');
    setDescriptorLevelForPart(clayBowl.parts[0], Descriptor.Clay, getDescriptorLevelFromPart(args.targetPart, Descriptor.Clay));

    return {
      message: 'Created a clay container.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        clayBowl
      ]
    };
  },

  // cutting cooked meat should make more meat
  [Descriptor.Cooked]: (args: IReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const cookedLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Cooked);

    if(carvesLevel <= 0)  return zeroFail(args);

    if(cookedLevel <= 1) {
      return {
        message: 'There is not enough food here to cut.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    // lower the number of carves
    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

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
      newSource: sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem,
      extraItems: [itemCopy]
    };
  },

  // fiber can be split into more fiber
  [Descriptor.Fiber]: (args: IReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const fiberLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Fiber);

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
    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

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
      newSource: sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem,
      extraItems: [itemCopy]
    };
  },

  [Descriptor.Glass]: (args: IReactionExtendedArgs) => {

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    const glassJar = getItemById('GlassJar-1');
    setDescriptorLevelForPart(glassJar.parts[0], Descriptor.Glass, getDescriptorLevelFromPart(args.targetPart, Descriptor.Glass));

    return {
      message: 'Created a glass container.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        glassJar
      ]
    };
  },

  [Descriptor.Leather]: (args: IReactionExtendedArgs) => {

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    const leatherFlask = getItemById('LeatherFlask-1');
    setDescriptorLevelForPart(leatherFlask.parts[0], Descriptor.Leather, getDescriptorLevelFromPart(args.targetPart, Descriptor.Leather));

    return {
      message: 'Created a leather container.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        leatherFlask
      ]
    };
  },

  // meaty things can be bled more, at the cost of meat levels
  [Descriptor.Meat]: (args: IReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const meatLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Meat);

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
    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

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

    const meatChunk = getItemById('MeatChunk-1');

    return {
      message: 'Cut the meat successfully.',
      success: true,
      checkBreaks: true,
      newSource: sourceItem,
      newTarget: newLevel <= 0 ? undefined : targetItem,
      extraItems: [
        meatChunk
      ]
    };
  },

  [Descriptor.Metal]: (args: IReactionExtendedArgs) => {

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    setDescriptorLevelForPart(args.targetPart, Descriptor.Container, 1);
    setFoundationalPart(args.targetPart);

    const metalCup = getItemById('MetalCup-1');
    setDescriptorLevelForPart(metalCup.parts[0], Descriptor.Metal, getDescriptorLevelFromPart(args.targetPart, Descriptor.Metal));

    return {
      message: 'Created a metal cup.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        metalCup
      ]
    };
  },

  [Descriptor.Rock]: (args: IReactionExtendedArgs) => {

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    const rockBowl = getItemById('RockBowl-1');
    setDescriptorLevelForPart(rockBowl.parts[0], Descriptor.Rock, getDescriptorLevelFromPart(args.targetPart, Descriptor.Rock));

    return {
      message: 'Created a rock cup.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        rockBowl
      ]
    };
  },

  // sticky transfers attributes
  [Descriptor.Sticky]: (args: IReactionExtendedArgs) => {

    const carvesLevel = getInteractionLevel(args.sourceItem, Interaction.Carves);
    if(carvesLevel <= 0) return zeroFail(args);

    const targetDescriptors = getAllDescriptorsForPart(args.targetPart);
    targetDescriptors.forEach(desc => {
      decreaseDescriptorLevelForPart(args.targetPart, desc, 1);
      increaseDescriptorLevelForPart(args.sourcePart, desc, 1);
    });

    return {
      message: 'Transferred attributes to source from target.',
      success: true,
      newSource: args.sourceItem,
      newTarget: getDescriptorLevelFromPart(args.targetPart, Descriptor.Sticky) <= 0 ? undefined : args.targetItem
    };
  },

  [Descriptor.Wood]: (args: IReactionExtendedArgs) => {

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

    decreaseInteractionLevel(sourceItem, Interaction.Carves, 1);

    const woodBucket = getItemById('WoodBucket-1');
    setDescriptorLevelForPart(woodBucket.parts[0], Descriptor.Wood, getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood));

    return {
      message: 'Carved a container out of the wood.',
      success: true,
      checkBreaks: false,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        woodBucket
      ]
    };
  },

};
