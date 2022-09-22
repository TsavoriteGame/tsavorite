import { getItemById } from '../getters';
import { getInteractionLevel, increaseDescriptorLevelForPart, decreaseInteractionLevel, decreaseDescriptorLevelForPart,
  getDescriptorLevelFromPart, getValidFulfilledRecipeForItem, hasFoundationalPart } from '../helpers';
import { Descriptor, Reactions, Interaction, ReactionExtendedArgs, ItemConfig } from '../interfaces';

const zeroFail = (args: ReactionExtendedArgs) => ({
  message: 'The tailor kit cannot use this material.',
  success: false,
  newSource: args.sourceItem,
  newTarget: args.targetItem
});

export const applications: Reactions = {

  // add full item to kit
  [Descriptor.Fiber]: (args: ReactionExtendedArgs) => {

    if (hasFoundationalPart(args.targetItem)) return zeroFail(args);

    const sourcePart = args.sourcePart;
    const targetPart = args.targetPart;

    Object.keys(targetPart.descriptors || {}).forEach(
      desc => increaseDescriptorLevelForPart(
        sourcePart,
        desc as Descriptor,
        targetPart.descriptors[desc].level ?? 0
      )
    );

    return {
      message: 'Added fiber to the tailor kit.',
      success: true,
      newSource: args.sourceItem,
      newTarget: undefined
    };
  },

  [Descriptor.Leather]: (args: ReactionExtendedArgs) => {

    if (hasFoundationalPart(args.targetItem)) return zeroFail(args);

    const sourcePart = args.sourcePart;
    const targetPart = args.targetPart;

    Object.keys(targetPart.descriptors || {}).forEach(
      desc => increaseDescriptorLevelForPart(
        sourcePart,
        desc as Descriptor,
        targetPart.descriptors[desc].level ?? 0
      )
    );

    return {
      message: 'Added leather to the tailor kit.',
      success: true,
      newSource: args.sourceItem,
      newTarget: undefined
    };
  },

  // if the tailor kit is filled with enough materials, make armor
  [Descriptor.Sticky]: (args: ReactionExtendedArgs) => {

    const tailorsLevel = getInteractionLevel(args.sourceItem, Interaction.Tailors);

    const sourceItem = args.sourceItem;
    const targetItem = args.targetItem;

    if (tailorsLevel <= 0) return zeroFail(args);

    const recipe = getValidFulfilledRecipeForItem(sourceItem);
    if (!recipe) {
      return {
        message: 'There are insufficient materials to tailor an item.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    const sourcePart = args.sourcePart;

    const tailorItem = getItemById(recipe.produces);

    Object.keys(sourcePart.descriptors || {}).forEach(d => {
      const descriptor = d as Descriptor;

      if (descriptor === Descriptor.Kit
       || descriptor === Descriptor.Leather || descriptor === Descriptor.Fiber) return;

      const descriptorLevel = getDescriptorLevelFromPart(sourcePart, descriptor);

      tailorItem.parts[0].descriptors[descriptor] = { level: descriptorLevel };
      decreaseDescriptorLevelForPart(sourcePart, descriptor, descriptorLevel);
    });

    recipe.ingredients.forEach(ingredient => sourcePart.descriptors[ingredient.descriptor] = { level: 0 });

    const newTailorLevel = decreaseInteractionLevel(sourceItem, Interaction.Tailors, 1);
    const newStickyLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);
    return {
      message: 'Tailored a piece of armor!',
      success: true,
      newSource: newTailorLevel > 0 ? sourceItem : undefined,
      newTarget: newStickyLevel > 0 ? targetItem : undefined,
      extraItems: [ tailorItem ]
    };
  }
};
