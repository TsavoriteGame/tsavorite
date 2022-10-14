import { getItemById } from '../getters';
import { getInteractionLevel, increaseDescriptorLevelForPart,
  decreaseInteractionLevel, getDescriptorLevel, decreaseDescriptorLevelForPart,
  getDescriptorLevelFromPart, increaseInteractionLevel, hasDescriptor,
  getAllDescriptorsForPart, setDescriptorLevelForPart } from '../helpers';
import { Descriptor, Reactions, Interaction, IReactionExtendedArgs } from '../interfaces';

const zeroFail = (args: IReactionExtendedArgs) => ({
  message: 'This item cannot smash anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem,
  extraItems: []
});

export const applications: Reactions = {

  // cold things can be destroyed
  [Descriptor.Cold]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    const coldLevel = getDescriptorLevel(targetItem, Descriptor.Cold);
    if(smashesLevel < coldLevel) {
      return {
        message: 'Item is too cold to smash',
        success: false,
        newSource: sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }


    decreaseInteractionLevel(args.sourceItem, Interaction.Smashes);

    return {
      message: 'Destroyed the cold item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: []
    };
  },

  // frozen things can also be destroyed
  [Descriptor.Frozen]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    const coldLevel = getDescriptorLevel(targetItem, Descriptor.Frozen);
    if(smashesLevel < coldLevel) {
      return {
        message: 'Item is too frozen to smash',
        success: false,
        newSource: sourceItem,
        newTarget: targetItem,
        extraItems: []
      };
    }


    decreaseInteractionLevel(args.sourceItem, Interaction.Smashes);

    return {
      message: 'Destroyed the frozen item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: []
    };
  },

  // glass can be turned into sand
  [Descriptor.Glass]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    const glassLevel = getDescriptorLevel(targetItem, Descriptor.Glass);

    const sand = getItemById('SandPile-1');
    setDescriptorLevelForPart(sand.parts[0], Descriptor.Sand, glassLevel);

    return {
      message: 'Destroyed the glass item.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        sand
      ]
    };
  },

  // meat can be turned into blood
  [Descriptor.Meat]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    if(hasDescriptor(args.targetItem, Descriptor.Frozen)) {
      return {
        message: 'Smashed the frozen meat.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: []
      };
    }


    const meatLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Meat, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Bloody, 1);

    if(meatLevel <= 0) {
      const bloodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Bloody);

      const blood = getItemById('Blood-1');
      setDescriptorLevelForPart(blood.parts[0], Descriptor.Bloody, bloodLevel);

      return {
        message: 'Pulverized the meat into blood.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          blood
        ]
      };
    }

    return {
      message: 'Turned some meat into blood.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // metal can be made sharp
  [Descriptor.Metal]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;
    const hotLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Hot);

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    if(hotLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, 1);

    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sharp);

    // items without an existing interaction or a carves interaction get to level that up
    if(!args.targetItem.interaction || args.targetItem.interaction.name === Interaction.Carves) {
      increaseInteractionLevel(args.targetItem, Interaction.Carves, 1);
    }

    // keys get bonus unlock levels
    if(args.targetItem.interaction?.name === Interaction.Unlocks) {
      increaseInteractionLevel(args.targetItem, Interaction.Unlocks, 1);
    }

    return {
      message: 'Sharpened the metal.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // rock can be turned into sand
  [Descriptor.Rock]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, 1);

    const rockLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Rock, 1);
    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Sand, 1);

    if(rockLevel <= 0) {
      const sandLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Sand);

      const sand = getItemById('SandPile-1');
      setDescriptorLevelForPart(sand.parts[0], Descriptor.Sand, sandLevel);

      return {
        message: 'Pulverized the rock into sand.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          sand
        ]
      };
    }

    return {
      message: 'Turned some rock into sand.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },

  // sticky transfers attributes
  [Descriptor.Sticky]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);
    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    const targetDescriptors = getAllDescriptorsForPart(args.targetPart);
    targetDescriptors.forEach(desc => {
      decreaseDescriptorLevelForPart(args.targetPart, desc, 1);
      increaseDescriptorLevelForPart(args.sourcePart, desc, 1);
    });

    return {
      message: 'Transferred attributes to source from target.',
      success: true,
      newSource: args.sourceItem,
      newTarget: getDescriptorLevelFromPart(args.targetPart, Descriptor.Sticky) <= 0 ? undefined : args.targetItem,
      extraItems: []
    };
  },

  // wood can be whittled down (heh)
  [Descriptor.Wood]: (args: IReactionExtendedArgs) => {

    const smashesLevel = getInteractionLevel(args.sourceItem, Interaction.Smashes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if(smashesLevel <= 0) {
      return zeroFail(args);
    }

    const targetWoodLevel = getDescriptorLevelFromPart(args.targetPart, Descriptor.Wood);

    decreaseInteractionLevel(sourceItem, Interaction.Smashes, targetWoodLevel);

    const woodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, smashesLevel);

    if(woodLevel <= 0) {
      return {
        message: 'Smashed the wood.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: []
      };
    }


    return {
      message: 'Broke some wood.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: []
    };
  },
};
