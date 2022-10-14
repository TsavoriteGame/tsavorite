import { getItemById } from '../getters';
import { getInteractionLevel,
  decreaseInteractionLevel,
  decreaseDescriptorLevelForPart,
  increaseDescriptorLevelForPart,
  increaseInteractionLevel,
  getDescriptorLevelFromPart,
  setDescriptorLevelForPart } from '../helpers';
import { Descriptor, Reactions, Interaction, IReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: IReactionExtendedArgs) => ({
  message: 'This item cannot ignite anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem,
  extraItems: []
});

const increaseHot = (args: IReactionExtendedArgs) => increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

const genericHotIncrease = (args: IReactionExtendedArgs, postCall = () => {}) => {
  const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

  const sourceItem = args.sourceItem;
  const targetItem = args.targetItem;

  if(ignitesLevel <= 0) {
    return zeroFail(args);
  }

  increaseHot(args);
  postCall();

  return {
    message: 'The hotness of the target has increased.',
    success: true,
    newSource: sourceItem,
    newTarget: targetItem,
    extraItems: []
  };
};

export const applications: Reactions = {

  // clay can turn into glass
  [Descriptor.Clay]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const clayLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Clay);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    const glassJar = getItemById('GlassJar-1');
    setDescriptorLevelForPart(glassJar.parts[0], Descriptor.Glass, getDescriptorLevelFromPart(args.targetPart, Descriptor.Clay));

    if(hotLevel > clayLevel) {
      return {
        message: 'It is turned into glass.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          glassJar
        ]
      };
    }


    return {
      message: 'The mud is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // cold gets less cold
  [Descriptor.Cold]: (args: IReactionExtendedArgs) => {
    const decreaseCold = () => {
      decreaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);

      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    };

    return genericHotIncrease(args, decreaseCold);
  },

  // combustibles get hot, bright, and lose a stack of combustible. source gets ignite++ and hot++
  [Descriptor.Combustible]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    if(getDescriptorLevelFromPart(args.targetPart, Descriptor.Combustible) === 0) {
      return {
        message: 'It cannot combust any further.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }


    increaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);
    increaseDescriptorLevelForPart(args.sourcePart, Descriptor.Hot, 1);

    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Combustible, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Blazing, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bright, 1);

    return {
      message: 'The target item heat has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // fiber burns away one stack at a time
  [Descriptor.Fiber]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const newFiberLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Fiber, 1);

    if(newFiberLevel <= 0) {
      return {
        message: 'The fiber has all burned away.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: []
      };
    }


    return {
      message: 'Some fiber has burned away.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // frozen gets less frozen
  [Descriptor.Frozen]: (args: IReactionExtendedArgs) => {
    const decreaseCold = () => {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

      decreaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);
    };

    return genericHotIncrease(args, decreaseCold);
  },

  // increase heat, shatter if temp mixes
  [Descriptor.Glass]: genericHotIncrease,

  // increase heat
  [Descriptor.Leather]: genericHotIncrease,

  // combustibles get hot, bright, and lose a stack of combustible. source gets ignite++ and hot++
  [Descriptor.Meat]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    if(getDescriptorLevelFromPart(args.targetPart, Descriptor.Meat) === 0) {
      return {
        message: 'It is overcooked.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          getItemById('OvercookedMeat-1')
        ]
      };
    }


    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Meat, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cooked, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bloody, 1);

    return {
      message: 'The meat is more cooked.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // metal gets hot, and can melt
  [Descriptor.Metal]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const metalLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Metal);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > metalLevel) {

      const wetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
      if(wetLevel > metalLevel) {
        const newMetalLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Metal, 1);

        if(newMetalLevel <= 0) {
          return {
            message: 'The metal was melted.',
            success: true,
            newSource: sourceItem,
            newTarget: undefined,
            extraItems: []
          };
        }

      }

      return {
        message: 'It is melting.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }

    return {
      message: 'The metal is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // turn mud into clay (eventually)
  [Descriptor.Mud]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const mudLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Mud);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel >= mudLevel) {

      const clay = getItemById('ClayBall-1');
      setDescriptorLevelForPart(clay.parts[0], Descriptor.Clay, mudLevel);

      return {
        message: 'The mud has ignited into clay.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          clay
        ]
      };
    }

    return {
      message: 'The heat of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // sand gets hot, and can melt and transform into glass
  [Descriptor.Sand]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > sandLevel) {

      const glass = getItemById('GlassShards-1');
      setDescriptorLevelForPart(glass.parts[0], Descriptor.Glass, sandLevel);

      return {
        message: 'The sand has become glass.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          glass
        ]
      };
    }

    return {
      message: 'The sand is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // increase cold
  [Descriptor.Rock]: genericHotIncrease,

  // remove sticky stacks from sticky stuff
  [Descriptor.Sticky]: (args: IReactionExtendedArgs) => {
    const decreaseExtra = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);
    };

    return genericHotIncrease(args, decreaseExtra);
  },

  // remove wet stacks from wet stuff
  [Descriptor.Wet]: (args: IReactionExtendedArgs) => {
    const decreaseExtra = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

      decreaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);
    };

    return genericHotIncrease(args, decreaseExtra);
  },

  // wood gets hot, and can ignite and slwoly burn down as it gets ignited
  [Descriptor.Wood]: (args: IReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) {
      return zeroFail(args);
    }

    const woodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > woodLevel) {

      increaseInteractionLevel(args.targetItem, Interaction.Ignites, 1);
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Blazing, 1);
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bright, 1);
      const newWoodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);

      if(newWoodLevel <= 0) {
        return {
          message: 'The wood was burned to ash.',
          success: true,
          newSource: sourceItem,
          newTarget: undefined,
          extraItems: []
        };
      }


      return {
        message: 'The wood has ignited.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }

    return {
      message: 'The wood is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },
};
