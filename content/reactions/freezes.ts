import { getItemById } from '../getters';
import { decreaseDescriptorLevelForPart, decreaseInteractionLevel, getDescriptorLevelFromPart,
  getInteractionLevel, hasDescriptor, increaseDescriptorLevelForPart } from '../helpers';
import { Descriptor, Interaction, IReactionExtendedArgs, Reactions } from '../interfaces';

const zeroFail = (args: IReactionExtendedArgs) => ({
  message: 'This item cannot freeze anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem,
  extraItems: []
});

const increaseCold = (args: IReactionExtendedArgs) => increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);

const genericColdIncrease = (args: IReactionExtendedArgs, postCall = () => {}) => {
  const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

  const sourceItem = args.sourceItem;
  const targetItem = args.targetItem;

  if(freezesLevel <= 0) {
    return zeroFail(args);
  }

  increaseCold(args);
  postCall();

  return {
    message: 'The coldness of the target has increased.',
    success: true,
    newSource: sourceItem,
    newTarget: targetItem,
    extraItems: []
  };
};

const tryToFreeze = (args: IReactionExtendedArgs, comparatorDescriptor: Descriptor) => {
  const coldLevel = increaseCold(args);
  const descLevel = getDescriptorLevelFromPart(args.targetPart, comparatorDescriptor);

  if(coldLevel >= descLevel) {
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Frozen, 1);
  }

};

export const applications: Reactions = {

  // lower heat; increase cold
  [Descriptor.Blazing]: (args: IReactionExtendedArgs) => {
    const decreaseHot = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Bright, 1);

      decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);
    };

    return genericColdIncrease(args, decreaseHot);
  },

  // add cold to the blood, try to freeze it
  [Descriptor.Bloody]: (args: IReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) {
      return zeroFail(args);
    }

    tryToFreeze(args, Descriptor.Bloody);

    decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // check if we should shatter glass
  [Descriptor.Glass]: genericColdIncrease,

  // lower heat; increase cold
  [Descriptor.Hot]: (args: IReactionExtendedArgs) => {
    const decreaseHot = () => {
      decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);
    };

    return genericColdIncrease(args, decreaseHot);
  },

  // increase cold
  [Descriptor.Meat]: (args: IReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) {
      return zeroFail(args);
    }

    tryToFreeze(args, Descriptor.Meat);

    decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // increase cold
  [Descriptor.Metal]: (args: IReactionExtendedArgs) => {
    const increaseSticky = () => {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);

      decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);
    };

    return genericColdIncrease(args, increaseSticky);
  },

  // turn mud into rock (eventually)
  [Descriptor.Mud]: (args: IReactionExtendedArgs) => {
    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) {
      return zeroFail(args);
    }

    tryToFreeze(args, Descriptor.Mud);

    decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);

    if(hasDescriptor(args.targetItem, Descriptor.Frozen)) {

      const mudLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Mud);

      return {
        message: 'The mud has frozen into rock.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          getItemById('Rock-1')
        ]
      };
    }

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // increase cold
  [Descriptor.Rock]: genericColdIncrease,

  // increase cold, potentially freeze
  [Descriptor.Wet]: (args: IReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) {
      return zeroFail(args);
    }

    tryToFreeze(args, Descriptor.Wet);

    decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

};
