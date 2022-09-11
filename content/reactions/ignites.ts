import { getInteractionLevel,
  decreaseInteractionLevel,
  getDescriptorFromPart, decreaseDescriptorLevelForPart, getDescriptor,
  setDescriptorLevel,
  increaseDescriptorLevelForPart,
  increaseInteractionLevel,
  getDescriptorLevelFromPart,
  setDescriptorLevelForPart,
  changePrimaryDescriptor} from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot ignite anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

const increaseHot = (args: ReactionExtendedArgs) => increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

const genericHotIncrease = (args: ReactionExtendedArgs, postCall = () => {}) => {
  const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

  const sourceItem = args.sourceItem;
  const targetItem = args.targetItem;

  if(ignitesLevel <= 0) return zeroFail(args);

  increaseHot(args);
  postCall();

  return {
    message: 'The hotness of the target has increased.',
    success: true,
    newSource: sourceItem,
    newTarget: targetItem
  };
};

export const applications: Reactions = {

  // cold gets less cold
  [Descriptor.Cold]: (args: ReactionExtendedArgs) => {
    const decreaseCold = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);
      decreaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);

      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
    };

    return genericHotIncrease(args, decreaseCold);
  },

  // combustibles get hot, bright, and lose a stack of combustible. source gets ignite++ and hot++
  [Descriptor.Combustible]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    if(getDescriptorLevelFromPart(args.targetPart, Descriptor.Combustible) === 0) {
      return {
        message: 'It cannot combust any further.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem
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
      newTarget: targetItem
    };
  },

  // fiber burns away one stack at a time
  [Descriptor.Fiber]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    const newFiberLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Fiber, 1);

    if(newFiberLevel <= 0) {
      return {
        message: 'The fiber has all burned away.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Some fiber has burned away.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // frozen gets less frozen
  [Descriptor.Frozen]: (args: ReactionExtendedArgs) => {
    const decreaseCold = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Frozen, 1);

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
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    if(getDescriptorLevelFromPart(args.targetPart, Descriptor.Meat) === 0) {
      return {
        message: 'It is overcooked.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [{
          name: 'Overcooked Meat',
          parts: [{ name: 'Rock Meat', primaryDescriptor: Descriptor.Rock, descriptors: { [Descriptor.Rock]: { level: 1 } } }]
        }]
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
      newTarget: targetItem
    };
  },

  // metal gets hot, and can melt
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    const metalLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Metal);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > metalLevel) {

      const wetLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
      if(wetLevel > metalLevel)
        decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Metal, 1);

      return {
        message: 'It is melting.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    return {
      message: 'The metal is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // sand gets hot, and can melt and transform into glass
  [Descriptor.Sand]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > sandLevel) {

      setDescriptorLevelForPart(args.targetPart, Descriptor.Sand, 0);
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Glass);
      changePrimaryDescriptor(args.targetPart, Descriptor.Glass);

      return {
        message: 'The sand has become glass.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    return {
      message: 'The sand is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // remove sticky stacks from sticky stuff
  [Descriptor.Sticky]: (args: ReactionExtendedArgs) => {
    const decreaseExtra = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);
    };

    return genericHotIncrease(args, decreaseExtra);
  },

  // remove wet stacks from wet stuff
  [Descriptor.Wet]: (args: ReactionExtendedArgs) => {
    const decreaseExtra = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

      decreaseInteractionLevel(args.sourceItem, Interaction.Ignites, 1);
    };

    return genericHotIncrease(args, decreaseExtra);
  },

  // wood gets hot, and can ignite and slwoly burn down as it gets ignited
  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {
    const ignitesLevel = getInteractionLevel(args.sourceItem, Interaction.Ignites);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(ignitesLevel <= 0) return zeroFail(args);

    const woodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);
    const hotLevel = increaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);

    if(hotLevel > woodLevel) {

      increaseInteractionLevel(args.targetItem, Interaction.Ignites, 1);
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Blazing, 1);
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bright, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);

      return {
        message: 'The wood has ignited.',
        success: true,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    return {
      message: 'The wood is hotter.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },
};
