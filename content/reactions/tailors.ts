import { getInteractionLevel, increaseDescriptorLevelForPart,
  decreaseInteractionLevel, getDescriptorLevel, decreaseDescriptorLevelForPart,
  getDescriptorLevelFromPart, increaseInteractionLevel, hasDescriptor, getAllDescriptorsForPart,
  getAllFulfilledRecipesForItem,
  getValidFulfilledRecipeForItem,
  setDescriptorLevel,
  increaseDescriptorLevel} from '../helpers';
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
    if (recipe === undefined) {
      return {
        message: 'There are insufficient materials to tailor an item.',
        success: false,
        newSource: args.sourceItem,
        newTarget: args.targetItem
      };
    }

    const sourcePart = args.sourcePart;

    const leftoverMaterials: ItemConfig[] = [];
    const tailorItem: ItemConfig = {
      name: recipe.name,
      parts: [
        {
          name: recipe.name,
          primaryDescriptor: recipe.ingredients[0].descriptor,
          descriptors: {}
        }
      ]
    };

    Object.keys(sourcePart.descriptors || {}).forEach(d => {
      const descriptor = d as Descriptor;

      if (descriptor === Descriptor.Leather || descriptor === Descriptor.Fiber) return;

      const descriptorLevel = getDescriptorLevelFromPart(sourcePart, descriptor);

      increaseDescriptorLevelForPart(tailorItem.parts[0], descriptor, descriptorLevel);

      decreaseDescriptorLevelForPart(sourcePart, descriptor, descriptorLevel);
    });

    let armorLevel = 0;
    recipe.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.name;
      const descriptor = ingredient.descriptor;
      const ingredientLevel = ingredient.level;

      const newIngredientLevel = decreaseDescriptorLevelForPart(sourcePart, descriptor, ingredientLevel);

      tailorItem.parts[0].descriptors[descriptor] = { level: ingredientLevel };

      if (newIngredientLevel > 0) {
        leftoverMaterials.push({
          name: ingredientName,
          parts: [
            {
              name: ingredientName,
              primaryDescriptor: descriptor,
              descriptors: { [descriptor]: { level: getDescriptorLevelFromPart(sourcePart, descriptor) } }
            }
          ]
        });

        decreaseDescriptorLevelForPart(sourcePart, descriptor, newIngredientLevel);
      }

      armorLevel += ingredientLevel;
    });

    increaseDescriptorLevel(tailorItem, recipe.descriptor as Descriptor, armorLevel);
    tailorItem.icon = recipe.icon;

    const newTailorLevel = decreaseInteractionLevel(sourceItem, Interaction.Tailors, 1);
    const newStickyLevel = decreaseDescriptorLevelForPart(args.targetPart, Descriptor.Sticky, 1);
    return {
      message: 'Tailored a piece of armor!',
      success: true,
      newSource: newTailorLevel > 0 ? sourceItem : undefined,
      newTarget: newStickyLevel > 0 ? targetItem : undefined,
      extraItems: [ tailorItem, ...leftoverMaterials ]
    };
  }
};
