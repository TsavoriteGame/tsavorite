import { getInteractionLevel, increaseDescriptorLevelForPart, decreaseInteractionLevel,
  decreaseDescriptorLevelForPart, getDescriptorLevelFromPart } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot wet anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

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
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Mud, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Dirt, 1);

    return {
      message: 'Made the dirt more muddy.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
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

  // metal gets slippery/wet
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) return zeroFail(args);

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
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

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

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newWetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    const woodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);

    if(newWetLevel >= woodLevel) {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Rotten, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);
    }

    return {
      message: 'Made the wood more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },
};
