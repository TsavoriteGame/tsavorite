import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, ItemConfig } from '../interfaces';

const getSmasher: (level: number, smashesLevel: number) => ItemConfig =
                  (level: number, smashesLevel: number) => ({
  name: `Level ${level} Smasher`,
  parts: [
    {
      name: 'Hammer',
      primaryDescriptor: Descriptor.Metal,
      descriptors: {
        [Descriptor.Metal]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Smashes, level: smashesLevel }
});

test('A level 2 smasher should shatter level 1 cold items', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Ice',
    parts: [
      {
        name: 'Ice',
        primaryDescriptor: Descriptor.Cold,
        descriptors: {
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newTarget).toEqual(undefined);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);

});

test('A level 2 smasher should not shatter level 3 cold items', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Ice',
    parts: [
      {
        name: 'Ice',
        primaryDescriptor: Descriptor.Cold,
        descriptors: {
          [Descriptor.Cold]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);

});

test('A level 2 smasher should shatter level 1 frozen items', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Ice',
    parts: [
      {
        name: 'Ice',
        primaryDescriptor: Descriptor.Frozen,
        descriptors: {
          [Descriptor.Frozen]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newTarget).toEqual(undefined);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);

});

test('A level 2 smasher should not shatter level 3 frozen items', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Ice',
    parts: [
      {
        name: 'Ice',
        primaryDescriptor: Descriptor.Frozen,
        descriptors: {
          [Descriptor.Frozen]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);

});

test('A level 2 smasher should shatter glass into sand', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(undefined);
  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Glass)).toBe(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Sand)).toBe(3);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(1);

});

test('A level 2 smasher should smash meat into blood', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 smasher should pulverize meat into blood', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);
  expect(result.newTarget).toBe(undefined);
  expect(result.extraItems.length).toBe(1);

  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Meat)).toBe(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Bloody)).toBe(1);

});

test('A level 2 smasher should delete frozen meat', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 3 },
          [Descriptor.Frozen]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(2);
  expect(result.newTarget).toBe(undefined);

});

test('A level 2 smasher should smash rock into sand', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Rock',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sand)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 smasher should pulverize rock into sand', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Rock',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(result.newTarget).toBe(undefined);
  expect(result.extraItems.length).toBe(1);

  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rock)).toBe(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Sand)).toBe(1);

});

test('A level 2 smasher should not interact with raw metal', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);

});

test('A level 2 smasher should sharpen hot metal', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Hot]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sharp)).toBe(1);
  expect(getInteractionLevel(result.newTarget, Interaction.Carves)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 smasher should not make hot metal with an unrelated interaction level up', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Hot]: { level: 1 }
        }
      }
    ],
    interaction: {
      name: Interaction.Smashes,
      level: 1
    }
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sharp)).toBe(1);
  expect(getInteractionLevel(result.newTarget, Interaction.Smashes)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 smasher should level up the unlock ability of keys if the key is hot and molded', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Key',
    parts: [
      {
        name: 'Key',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Hot]: { level: 1 }
        }
      }
    ],
    interaction: {
      name: Interaction.Unlocks,
      level: 1
    }
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sharp)).toBe(1);
  expect(getInteractionLevel(result.newTarget, Interaction.Unlocks)).toBe(2);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 smasher should smash level 1 wood', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Smashes)).toBe(1);
  expect(result.newTarget).toBe(undefined);

});

test('A level 2 smasher should chunk off some parts of level 3 wood', () => {

  const source = getSmasher(1, 2);

  const target: ItemConfig = {
    name: 'Level 3 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toBe(undefined);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toBe(1);

});
