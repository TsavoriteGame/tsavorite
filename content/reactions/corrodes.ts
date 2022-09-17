import { getInteractionLevel, decreaseInteractionLevel, decreaseDescriptorLevelForPart,
  increaseDescriptorLevelForPart, getAllDescriptorsForPart, hasDescriptor,
  getPartWithDescriptor, getDescriptorLevel, getDescriptorLevelFromPart } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot corrode anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

const containerCheck: (args: ReactionExtendedArgs, glassLevel: number) => ReactionResponse = (args: ReactionExtendedArgs, glassLevel) => {

  const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);
  if (corrodesLevel <= 0) return zeroFail(args);

  decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);

  // if empty bottle
  if (args.targetItem.parts.length === 1) {
    return {
      success: true,
      message: 'Introduced corrosive material to the container.',
      newSource: args.sourceItem,
      newTarget: undefined,
      extraItems: [
        { name: 'Acid Flask Lv.1', parts: [
          { name: 'Bottle', primaryDescriptor: Descriptor.Glass, foundational: true,
            descriptors: { [Descriptor.Glass]: { level: glassLevel }, [Descriptor.Container]: { level: 1 } } },
          { name: 'Acid', primaryDescriptor: Descriptor.Corrosive, descriptors: { [Descriptor.Corrosive]: { level: 1 } } }
        ] }
      ]
    };
  }

  increaseDescriptorLevelForPart(getPartWithDescriptor(args.targetItem, Descriptor.Corrosive), Descriptor.Corrosive, 1);

  return {
    success: true,
    message: 'Added more corrosive material to the container.',
    newSource: args.sourceItem,
    newTarget: args.targetItem
  };
};

export const applications: Reactions = {

  // combines acid and blood into goo
  [Descriptor.Bloody]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Bloody, 1);

    if (getAllDescriptorsForPart(args.targetPart).length <= 0) {
      return {
        message: 'Turned all blood into goo.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined,
        extraItems: [
          { name: 'Goo', parts: [
            { name: 'Goo', primaryDescriptor: Descriptor.Sticky, descriptors: { [Descriptor.Sticky]: { level: 1 } } }
          ] }
        ]
      };
    }

    return {
      message: 'Turned blood into goo.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem,
      extraItems: [
        { name: 'Goo', parts: [
          { name: 'Goo', primaryDescriptor: Descriptor.Sticky, descriptors: { [Descriptor.Sticky]: { level: 1 } } }
        ] }
      ]
    };
  },

  // dissolve a level of clay
  [Descriptor.Clay]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0)
      return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Clay, 1);

    if (getDescriptorLevelFromPart(args.targetPart, Descriptor.Clay) <= 0) {
      return {
        message: 'Completely dissolved the clay.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Dissolved some of the clay.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // dissolve a level of dirt
  [Descriptor.Dirt]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0)
      return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Dirt, 1);

    if (getDescriptorLevelFromPart(args.targetPart, Descriptor.Dirt) <= 0) {
      return {
        message: 'Completely dissolved the dirt.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Dissolved some of the dirt.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // dissolve a level of fiber
  [Descriptor.Fiber]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0)
      return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Fiber, 1);

    if (getDescriptorLevelFromPart(args.targetPart, Descriptor.Fiber) <= 0) {
      return {
        message: 'Completely dissolved the fiber.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Dissolved some of the fiber.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // if container, fill container
  [Descriptor.Glass]: (args: ReactionExtendedArgs) => {

    if (hasDescriptor(args.targetItem, Descriptor.Container))
      return containerCheck(args, getDescriptorLevel(args.targetItem, Descriptor.Glass));

    return zeroFail(args);
  },

  // damage leather, and possibly destroy it
  [Descriptor.Leather]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    const newLeatherLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Leather, 1);

    if (newLeatherLevel <= 0) {
      return {
        message: 'The leather was fully corroded.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'The leather has been damaged.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // meat becomes rotten
  [Descriptor.Meat]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);

    return {
      message: 'Made the meat rotten.',
      success: true,
      newSource: sourceItem,
      newTarget: undefined,
      extraItems: [
        { name: 'Rotten Meat Chunk Lv.1', parts: [
          { name: 'Rotten Meat Chunk Lv.1', primaryDescriptor: Descriptor.Rotten, descriptors: { [Descriptor.Rotten]: { level: 1 } }}
        ] }
      ]
    };
  },

  // tarnish metal, and possibly destroy it
  [Descriptor.Metal]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    const newMetalLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Metal, 1);

    if (newMetalLevel <= 0) {
      return {
        message: 'The metal was fully corroded.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'The metal has been tarnished.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // dissolve a level of mud
  [Descriptor.Mud]: (args: ReactionExtendedArgs) => {

    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0)
      return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Mud, 1);

    if (getDescriptorLevelFromPart(args.targetPart, Descriptor.Mud) <= 0) {
      return {
        message: 'Completely dissolved the fiber.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Dissolved some of the fiber.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // removes a level of wet from an item
  [Descriptor.Wet]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);

    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wet, 1);

    return {
      message: 'The wetness was reduced.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  },

  // make wood rotten, and possibly destroy it
  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (corrodesLevel <= 0) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);

    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Rotten, 1);
    const newWoodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);

    if (newWoodLevel <= 0) {
      return {
        message: 'The wood collapsed to rot.',
        success: true,
        newSource: sourceItem,
        newTarget: undefined
      };
    }

    return {
      message: 'Made the wood more rotten.',
      success: true,
      newSource: sourceItem,
      newTarget: targetItem
    };
  }
};
