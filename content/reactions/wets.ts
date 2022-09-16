import { getInteractionLevel, increaseDescriptorLevelForPart, decreaseInteractionLevel,
  decreaseDescriptorLevelForPart, getDescriptorLevelFromPart, hasDescriptor, increaseDescriptorLevel } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot wet anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

const containerCheck: (args: ReactionExtendedArgs) => ReactionResponse = (args: ReactionExtendedArgs) => {

  const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);
  if(wetsLevel <= 0) return zeroFail(args);

  decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
  increaseDescriptorLevel(args.targetItem, Descriptor.Wet, 1);

  return {
    success: true,
    message: 'Added some water to the container.',
    newSource: args.sourceItem,
    newTarget: args.targetItem
  };
};

export const applications: Reactions = {

  // blood can be made wet
  [Descriptor.Bloody]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the blood more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // clay gets slippery/wet
  [Descriptor.Clay]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the clay more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // cold can be stacked more
  [Descriptor.Cold]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);

    return {
      message: 'Made the cold more cold.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // combustibles can be made less so
  [Descriptor.Combustible]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newCombust = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Combustible, 1);
    if(newCombust <= 0)
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the combustible less so.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // dirt can be made into mud
  [Descriptor.Dirt]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newDirtLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Dirt, 1);

    return {
      message: 'Made the dirt more muddy.',
      success: true,
      newSource: sourceItem,
      newTarget: newDirtLevel <= 0 ? undefined : targetItem,
      extraItems: [
        { name: 'Mud', parts: [
          { name: 'Mud', primaryDescriptor: Descriptor.Mud, descriptors: {
            [Descriptor.Mud]: { level: 1 },
            [Descriptor.Wet]: { level: 1 }
          } }
        ] }
      ]
    };
  },

  // electricity conducts and propagates
  [Descriptor.Electric]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.sourcePart, Descriptor.Electric, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the electricity more shared.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // frozen things get more frozen and sticky
  [Descriptor.Frozen]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Frozen, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);

    return {
      message: 'Made the frozen more frozen.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // glass gets slippery/wet
  [Descriptor.Glass]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the glass more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // hot things get less hot
  [Descriptor.Hot]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    return {
      message: 'Made the hot less hot.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // leather gets slippery/wet
  [Descriptor.Leather]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the leather more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // meat gets wet, I guess
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the meat a sloppy steak.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // metal gets slippery/wet
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the metal more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // rock gets slippery/wet
  [Descriptor.Rock]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the rock more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // sand gets wet
  [Descriptor.Sand]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newWetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);

    if(newWetLevel >= sandLevel) {
      return {
        message: 'Made the sand into mud through the power of water.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          { name: 'Mud', parts: [
            { name: 'Mud', primaryDescriptor: Descriptor.Mud, descriptors: { [Descriptor.Mud]: { level: sandLevel } } }
          ] }
        ]
      };
    }

    return {
      message: 'Made the sand more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // slippery gets more slippery. and wet.
  [Descriptor.Slippery]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the slippery more wet and slippery.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // wet gets more slippery. and wet.
  [Descriptor.Wet]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the wet more wet and slippery.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // wood gets wet, and potentially rotten
  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);

    const newWetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    const woodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);

    if(newWetLevel >= woodLevel) {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Rotten, 1);
      const newWoodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);

      if(newWoodLevel <= 0) {
        return {
          message: 'The wood collapsed to rot.',
          success: true,
          newSource: sourceItem,
          newTarget: undefined
        };
      }
    }

    return {
      message: 'Made the wood more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },
};
