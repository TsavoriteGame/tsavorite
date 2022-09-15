import { getInteractionLevel, increaseDescriptorLevelForPart,
  decreaseInteractionLevel, getDescriptorLevel, decreaseDescriptorLevelForPart,
  getDescriptorLevelFromPart, increaseInteractionLevel, hasDescriptor } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot smash anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

export const applications: Reactions = {

  // cold things can be destroyed
  [Descriptor.Cold]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    const coldLevel = getDescriptorLevel(targetItem, Descriptor.Cold);
    if(smashesLevel < coldLevel) {
      return {
        message: 'Item is too cold to smash',
        success: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Smashes);

    return {
      message: 'Destroyed the cold item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined
    };
  },

  // frozen things can also be destroyed
  [Descriptor.Frozen]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    const coldLevel = getDescriptorLevel(targetItem, Descriptor.Frozen);
    if(smashesLevel < coldLevel) {
      return {
        message: 'Item is too frozen to smash',
        success: false,
        newSource: sourceItem,
        newTarget: targetItem
      };
    }

    decreaseInteractionLevel(args.sourceItem, Interaction.Smashes);

    return {
      message: 'Destroyed the frozen item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined
    };
  },

  // glass can be turned into sand
  [Descriptor.Glass]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    const glassLevel = getDescriptorLevel(targetItem, Descriptor.Glass);

    return {
      message: 'Destroyed the glass item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        { name: 'Sand', parts: [
          { name: 'Sand', primaryDescriptor: Descriptor.Sand, descriptors: { [Descriptor.Sand]: { level: glassLevel } } }
        ] }
      ]
    };
  },

  // meat can be turned into blood
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    if(hasDescriptor(args.targetItem, Descriptor.Frozen)) {
      return {
        message: 'Smashed the frozen meat.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    const meatLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Meat, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bloody, 1);

    if(meatLevel <= 0) {
      const bloodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Bloody);

      return {
        message: 'Pulverized the meat into blood.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          { name: 'Blood', parts: [
            { name: 'Blood', primaryDescriptor: Descriptor.Bloody, descriptors: { [Descriptor.Bloody]: { level: bloodLevel } } }
          ] }
        ]
      };
    }

    return {
      message: 'Turned some meat into blood.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // metal can be made sharp
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const hotLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Hot);

    if(smashesLevel <= 0) return zeroFail(args);

    if(hotLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, 1);

    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sharp);

    // items without an existing interaction or a carves interaction get to level that up
    if(!args.targetItem.interaction || args.targetItem.interaction.name === Interaction.Carves)
      increaseInteractionLevel(args.targetItem, Interaction.Carves, 1);

    // keys get bonus unlock levels
    if(args.targetItem.interaction?.name === Interaction.Unlocks)
      increaseInteractionLevel(args.targetItem, Interaction.Unlocks, 1);

    return {
      message: 'Sharpened the metal.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // rock can be turned into sand
  [Descriptor.Rock]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, 1);

    const rockLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Rock, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sand, 1);

    if(rockLevel <= 0) {
      const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);

      return {
        message: 'Pulverized the rock into sand.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          { name: 'Sand', parts: [
            { name: 'Sand', primaryDescriptor: Descriptor.Sand, descriptors: { [Descriptor.Sand]: { level: sandLevel } } }
          ] }
        ]
      };
    }

    return {
      message: 'Turned some rock into sand.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // wood can be whittled down (heh)
  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) return zeroFail(args);

    const targetWoodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, targetWoodLevel);

    const woodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, smashesLevel);

    if(woodLevel <= 0) {
      return {
        message: 'Smashed the wood.',
        success: true,
        newSource: getInteractionLevel(args.sourceItem, Interaction.Smashes) <= 0 ? undefined : sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Broke some wood.',
      success: true,
      newSource: getInteractionLevel(args.sourceItem, Interaction.Smashes) <= 0 ? undefined : sourceItem,
      newTarget: targetItem
    };
  },
};
