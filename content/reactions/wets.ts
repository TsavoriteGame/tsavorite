import { getItemById } from '../getters';
import { getInteractionLevel, increaseDescriptorLevelForPart, decreaseInteractionLevel,
  decreaseDescriptorLevelForPart, getDescriptorLevelFromPart, hasDescriptor,
  increaseDescriptorLevel, setDescriptorLevelForPart } from '../helpers';
import { Descriptor, Reactions, Interaction, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

const zeroFail = (args: IReactionExtendedArgs) => ({
  message: 'This item cannot wet anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem,
  extraItems: []
});

const containerCheck: (args: IReactionExtendedArgs) => IReactionResponse = (args: IReactionExtendedArgs) => {

  const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);
  if(wetsLevel <= 0) {
    return zeroFail(args);
  }

  decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
  increaseDescriptorLevel(args.targetItem, Descriptor.Wet, 1);

  return {
    success: true,
    message: 'Added some water to the container.',
    newSource: args.sourceItem,
    newTarget: args.targetItem,
    extraItems: []
  };
};

export const applications: Reactions = {

  // blood can be made wet
  [Descriptor.Bloody]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the blood more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // clay gets slippery/wet
  [Descriptor.Clay]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the clay more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // cold can be stacked more
  [Descriptor.Cold]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);

    return {
      message: 'Made the cold more cold.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // combustibles can be made less so
  [Descriptor.Combustible]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newCombust = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Combustible, 1);
    if(newCombust <= 0) {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    }

    return {
      message: 'Made the combustible less so.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // corrosives should be diluted
  [Descriptor.Corrosive]: (args: IReactionExtendedArgs) => {
    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newCorrosiveLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Corrosive, 1);

    if (newCorrosiveLevel <= 0) {
      return {
        message: 'Diluted the corrosive material into water.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          getItemById('Water-1')
        ]
      };
    }


    return {
      message: 'Diluted the corrosive substance.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // dirt can be made into mud
  [Descriptor.Dirt]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newDirtLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Dirt, 1);

    const mud = getItemById('MudBall-1');
    setDescriptorLevelForPart(mud.parts[0], Descriptor.Wet, 1);

    return {
      message: 'Made the dirt more muddy.',
      success: true,
      newSource: sourceItem,
      newTarget: newDirtLevel <= 0 ? undefined : targetItem,
      extraItems: [
        mud
      ]
    };
  },

  // electricity conducts and propagates
  [Descriptor.Electric]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.sourcePart, Descriptor.Electric, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the electricity more shared.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // frozen things get more frozen and sticky
  [Descriptor.Frozen]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Frozen, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);

    return {
      message: 'Made the frozen more frozen.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // glass gets slippery/wet
  [Descriptor.Glass]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the glass more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // hot things get less hot
  [Descriptor.Hot]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    return {
      message: 'Made the hot less hot.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // leather gets slippery/wet
  [Descriptor.Leather]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the leather more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // meat gets wet, I guess
  [Descriptor.Meat]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the meat more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // metal gets slippery/wet
  [Descriptor.Metal]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the metal more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // rock gets slippery/wet
  [Descriptor.Rock]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);

    return {
      message: 'Made the rock more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // sand gets wet
  [Descriptor.Sand]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    const newWetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);

    if(newWetLevel >= sandLevel) {

      const mud = getItemById('MudBall-1');
      setDescriptorLevelForPart(mud.parts[0], Descriptor.Mud, sandLevel);

      return {
        message: 'Made the sand into mud through the power of water.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          mud
        ]
      };
    }

    return {
      message: 'Made the sand more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // slippery gets more slippery. and wet.
  [Descriptor.Slippery]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the slippery more wet and slippery.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // wet gets more slippery. and wet.
  [Descriptor.Wet]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Wets, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Slippery, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'Made the wet more wet and slippery.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // wood gets wet, and potentially rotten
  [Descriptor.Wood]: (args: IReactionExtendedArgs) => {

    const wetsLevel = getInteractionLevel(args.sourceItem, Interaction.Wets);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(wetsLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Container)) {
      return containerCheck(args);
    }

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
          newTarget: undefined,
          extraItems: []
        };
      }

    }

    return {
      message: 'Made the wood more wet.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },
};
