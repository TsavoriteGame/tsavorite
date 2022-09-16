import { getInteractionLevel, decreaseInteractionLevel, decreaseDescriptorLevelForPart,
  increaseDescriptorLevelForPart, increaseInteractionLevel, getAllDescriptorsForPart ,getDescriptorLevelFromPart, increaseDescriptorLevel, hasDescriptor } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs, ReactionResponse } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'This item cannot corrode anything.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

const containerCheck: (args: ReactionExtendedArgs) => ReactionResponse = (args:ReactionExtendedArgs) => {

  const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);
  if (0 >= corrodesLevel) return zeroFail(args);

  decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
  increaseDescriptorLevel(args.targetItem, Descriptor.Corrosive, 1);

  return {
    success: true,
    message: 'Added corrosive material to the container.',
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

    if (0 >= corrodesLevel) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Bloody, 1);

    if (0 >= getAllDescriptorsForPart(args.targetPart).length)
    {
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

  // if container, fill container
  [Descriptor.Glass]: (args: ReactionExtendedArgs) => {
    
    if (hasDescriptor(args.targetItem, Descriptor.Container)) return containerCheck(args);

    return zeroFail(args);
  },

  // damage leather, and possibly destroy it
  [Descriptor.Leather]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (0 >= corrodesLevel) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    const newLeatherLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Leather, 1);
    
    if (0 >= newLeatherLevel)
    {
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

    if (0 >= corrodesLevel) return zeroFail(args);

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

    if (0 >= corrodesLevel) return zeroFail(args);

    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);
    const newMetalLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Metal, 1);
    
    if (0 >= newMetalLevel)
    {
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

  // make wood rotten, and possibly destroy it
  [Descriptor.Wood]: (args: ReactionExtendedArgs) => {
    const corrodesLevel = getInteractionLevel(args.sourceItem, Interaction.Corrodes);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (0 >= corrodesLevel) return zeroFail(args);
    
    decreaseInteractionLevel(args.sourceItem, Interaction.Corrodes, 1);

    increaseDescriptorLevelForPart(args.targetPart, Descriptor.Rotten, 1);
    const newWoodLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Wood, 1);

    if (0 >= newWoodLevel)
    {
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