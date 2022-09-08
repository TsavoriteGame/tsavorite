
import { getDescriptorLevel, getInteractionLevel, getReaction } from '../helpers';
import { Interaction, Descriptor, ItemConfig } from '../interfaces';

const getCarver: (level: number, carvesLevel: number) => ItemConfig = (level: number, carvesLevel: number) => ({
  name: `Level ${level} Carver`,
  parts: [
    {
      name: 'Blade',
      descriptors: {
        [Descriptor.Metal]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Carves, level: carvesLevel }
});

test('A level 2 carver should bleed a level 2 meat', () => {

  const carver = getCarver(1, 2);

  const meat: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        descriptors: {
          [Descriptor.Meat]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Meat)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Carves)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Slippery)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);

});

test('A level 2 carver should bleed a level 2 meat and add blood to the blood pile', () => {

  const carver = getCarver(1, 2);

  const meat: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        descriptors: {
          [Descriptor.Meat]: { level: 2 },
          [Descriptor.Bloody]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Meat)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Carves)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Slippery)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(3);

});

test('A level 1 carver should break after bleeding any meat', () => {

  const carver = getCarver(1, 1);

  const meat: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Haunch',
        descriptors: {
          [Descriptor.Meat]: { level: 2 },
          [Descriptor.Bloody]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Meat)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(3);

});

test('A level 1 carver should cut a level 2 fiber in half', () => {

  const carver = getCarver(1, 1);

  const fiber: ItemConfig = {
    name: 'Level 2 Fiber',
    parts: [
      {
        name: 'String',
        descriptors: {
          [Descriptor.Fiber]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Fiber)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: fiber,
    targetPart: fiber.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Fiber)).toEqual(1);
  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);

});

test('A level 1 carver should cut a level 1 from a level 3 meat', () => {

  const carver = getCarver(1, 1);

  const meat: ItemConfig = {
    name: 'Level 3 Meat',
    parts: [
      {
        name: 'Meat',
        descriptors: {
          [Descriptor.Cooked]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Cooked)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cooked)).toEqual(2);
  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Cooked)).toEqual(1);

});
