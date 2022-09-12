import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, ItemConfig } from '../interfaces';

const getTorch: (level: number, ignitesLevel: number) => ItemConfig =
                (level: number, ignitesLevel: number) => ({
  name: `Level ${level} Torch`,
  parts: [
    {
      name: 'Torch',
      primaryDescriptor: Descriptor.Hot,
      descriptors: {
        [Descriptor.Hot]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Ignites, level: ignitesLevel }
});

test('A level 2 torch should remove cold and add wet', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Cold',
    parts: [
      {
        name: 'Cold',
        primaryDescriptor: Descriptor.Cold,
        descriptors: {
          [Descriptor.Cold]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should thaw frozen', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Cold',
    parts: [
      {
        name: 'Cold',
        primaryDescriptor: Descriptor.Frozen,
        descriptors: {
          [Descriptor.Cold]: { level: 2 },
          [Descriptor.Frozen]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 torch should warm glass', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should shatter cold glass', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Cold]: { level: 2 },
          [Descriptor.Glass]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

});

test('A level 2 torch should warm up leather', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Leather)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should make sticky things less so', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Goo',
    parts: [
      {
        name: 'Goo',
        primaryDescriptor: Descriptor.Sticky,
        descriptors: {
          [Descriptor.Sticky]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should remove stacks of wet', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Wet',
    parts: [
      {
        name: 'Wet',
        primaryDescriptor: Descriptor.Wet,
        descriptors: {
          [Descriptor.Wet]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(0);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 2 torch should remove stacks of fiber', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Fiber',
    parts: [
      {
        name: 'Fiber',
        primaryDescriptor: Descriptor.Fiber,
        descriptors: {
          [Descriptor.Fiber]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Fiber)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(0);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 2 torch should burn fiber away entirely if possible', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Fiber',
    parts: [
      {
        name: 'Fiber',
        primaryDescriptor: Descriptor.Fiber,
        descriptors: {
          [Descriptor.Fiber]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

});

test('A level 2 torch should combust oil', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Oil',
    parts: [
      {
        name: 'Oil',
        primaryDescriptor: Descriptor.Combustible,
        descriptors: {
          [Descriptor.Combustible]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(3);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(2);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Blazing)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bright)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Combustible)).toEqual(0);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 torch should not be able to combust items beyond their ability', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Oil',
    parts: [
      {
        name: 'Oil',
        primaryDescriptor: Descriptor.Combustible,
        descriptors: {
          [Descriptor.Combustible]: { level: 0 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Blazing)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bright)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Combustible)).toEqual(0);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(0);

});

test('A level 2 torch should cook meat', () => {

  const source = getTorch(1, 2);

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

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cooked)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 torch should overcook meat that is already cooked to the max', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 0 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(result.newTarget).toBe(undefined);
  expect(result.extraItems.length).toBe(1);

  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Meat)).toEqual(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rock)).toEqual(1);

});

test('A level 2 torch should add hot to metal', () => {

  const source = getTorch(1, 2);

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

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should add wet to metal that is already too hot', () => {

  const source = getTorch(1, 2);

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

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 torch should warm up sand', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Sand',
    parts: [
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Sand)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should melt already-warm sand into glass', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Sand',
    parts: [
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 1 },
          [Descriptor.Hot]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toEqual(1);
  expect(result.newTarget.parts[0].primaryDescriptor).toBe(Descriptor.Glass);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should make wood hot', () => {

  const source = getTorch(1, 2);

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

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should make hot wood burn and become a torch', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 2 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(3);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Blazing)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bright)).toEqual(1);

  expect(getInteractionLevel(result.newTarget, Interaction.Ignites)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(4);

});

test('A level 2 torch should heat up clay', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Clay',
    parts: [
      {
        name: 'Clay',
        primaryDescriptor: Descriptor.Clay,
        descriptors: {
          [Descriptor.Clay]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Clay)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toEqual(0);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 torch should heat up hot clay into glass', () => {

  const source = getTorch(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Clay',
    parts: [
      {
        name: 'Clay',
        primaryDescriptor: Descriptor.Clay,
        descriptors: {
          [Descriptor.Clay]: { level: 2 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Ignites)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(1);

  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Clay)).toEqual(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Glass)).toEqual(2);

});

