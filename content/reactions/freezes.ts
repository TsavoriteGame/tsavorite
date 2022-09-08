import { decreaseDescriptorLevelForPart, decreaseInteractionLevel, getDescriptorLevelFromPart,
  getInteractionLevel, increaseDescriptorLevelForPart } from '../helpers';
import { Descriptor, Interaction, ReactionExtendedArgs, Reactions } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot freeze anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

const increaseCold = (args: ReactionExtendedArgs) => increaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);

const genericColdIncrease = (args: ReactionExtendedArgs, postCall = () => {}) => {
  const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

  const sourceItem = args.sourceItem;
  const targetItem = args.targetItem;

  if(freezesLevel <= 0) return zeroFail(args);

  increaseCold(args);
  postCall();

  return {
    message: 'The coldness of the target has increased.',
    success: true,
    newSource: sourceItem,
    newTarget: targetItem
  };
};

const tryToFreeze = (args: ReactionExtendedArgs, comparatorDescriptor: Descriptor) => {
  const coldLevel = increaseCold(args);
  const descLevel = getDescriptorLevelFromPart(args.targetPart, comparatorDescriptor);

  if(coldLevel >= descLevel)
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Frozen, 1);

};

export const applications: Reactions = {

  // add cold to the blood, try to freeze it
  [Descriptor.Bloody]: (args: ReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) return zeroFail(args);

    tryToFreeze(args, Descriptor.Bloody);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // check if we should shatter glass
  [Descriptor.Glass]: genericColdIncrease,

  // lower heat; increase cold
  [Descriptor.Hot]: (args: ReactionExtendedArgs) => {
    const decreaseHot = () => {
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Hot, 1);
      decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Cold, 1);
      decreaseInteractionLevel(args.sourceItem, Interaction.Freezes, 1);
    };

    return genericColdIncrease(args, decreaseHot);
  },

  // increase cold
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) return zeroFail(args);

    tryToFreeze(args, Descriptor.Meat);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // increase cold
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {
    const increaseSticky = () => {
      increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);
    };

    return genericColdIncrease(args, increaseSticky);
  },

  // increase cold
  [Descriptor.Rock]: genericColdIncrease,

  // increase cold, potentially freeze
  [Descriptor.Wet]: (args: ReactionExtendedArgs) => {

    const freezesLevel = getInteractionLevel(args.sourceItem, Interaction.Freezes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(freezesLevel <= 0) return zeroFail(args);

    tryToFreeze(args, Descriptor.Wet);

    return {
      message: 'The coldness of the target has increased.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

};
