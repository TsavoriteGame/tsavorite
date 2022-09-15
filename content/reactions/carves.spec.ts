
import { getAllDescriptorsForPart, getDescriptorLevel,
  getInteractionLevel, getReactionBetweenTwoItems, hasFoundationalPart } from '../helpers';
import { Interaction, Descriptor, ItemConfig } from '../interfaces';

const getCarver: (level: number, carvesLevel: number, desc?: Descriptor) => ItemConfig =
                 (level: number, carvesLevel: number, desc = Descriptor.Metal) => ({
  name: `Level ${level} Carver`,
  parts: [
    {
      name: 'Blade',
      primaryDescriptor: desc,
      descriptors: {
        [desc]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Carves, level: carvesLevel }
});

test('A level 2 carver should bleed a level 2 meat', () => {

  const source = getCarver(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Carves)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Slippery)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Meat)).toEqual(1);

});

test('A level 2 carver should bleed a level 2 meat and add blood to the blood pile', () => {

  const source = getCarver(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 2 },
          [Descriptor.Bloody]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Carves)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Slippery)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(3);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 1 carver should break after bleeding any meat', () => {

  const source = getCarver(1, 1);

  const target: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 2 },
          [Descriptor.Bloody]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(3);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 1 carver should cut a level 2 fiber in half', () => {

  const source = getCarver(1, 1);

  const target: ItemConfig = {
    name: 'Level 2 Fiber',
    parts: [
      {
        name: 'String',
        primaryDescriptor: Descriptor.Fiber,
        descriptors: {
          [Descriptor.Fiber]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Fiber)).toEqual(1);
  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 1 carver should cut a level 1 from a level 3 cooked meat', () => {

  const source = getCarver(1, 1);

  const target: ItemConfig = {
    name: 'Level 3 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Cooked,
        descriptors: {
          [Descriptor.Cooked]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cooked)).toEqual(2);
  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Cooked)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 1 carver should be able to carve a glass container', () => {

  const source = getCarver(1, 1);

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
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(hasFoundationalPart(result.extraItems[0])).toEqual(true);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Glass)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Container)).toEqual(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);
});

test('A level 1 carver should be able to carve a leather container', () => {

  const source = getCarver(1, 1);

  const target: ItemConfig = {
    name: 'Level 3 Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(hasFoundationalPart(result.extraItems[0])).toEqual(true);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Container)).toEqual(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);
});

test('A level 1 glass carver should NOT be able to carve a leather container', () => {

  const source = getCarver(1, 1, Descriptor.Glass);

  const target: ItemConfig = {
    name: 'Level 3 Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
});

test('A level 1 carver should be able to carve a metal container', () => {

  const source = getCarver(1, 1);

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
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(hasFoundationalPart(result.extraItems[0])).toEqual(true);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Metal)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Container)).toEqual(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);
});

test('A level 1 glass carver should NOT be able to carve a metal container', () => {

  const source = getCarver(1, 1, Descriptor.Glass);

  const target: ItemConfig = {
    name: 'Level 3 Metal',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
});

test('A level 1 carver should be able to carve a rock container', () => {

  const source = getCarver(1, 1);

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
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(hasFoundationalPart(result.extraItems[0])).toEqual(true);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rock)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Container)).toEqual(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);
});

test('A level 1 glass carver should NOT be able to carve a rock container', () => {

  const source = getCarver(1, 1, Descriptor.Glass);

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

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
});

test('A level 1 carver should be able to carve a wood container', () => {

  const source = getCarver(1, 1);

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
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(hasFoundationalPart(result.extraItems[0])).toEqual(true);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Wood)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Container)).toEqual(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);
});

test('A level 1 glass carver should NOT be able to carve a wood container', () => {

  const source = getCarver(1, 1, Descriptor.Glass);

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

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
});
