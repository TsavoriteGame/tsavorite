
import { getDescriptorLevel, getInteractionLevel, getReaction, hasFoundationalPart } from '../helpers';
import { Interaction, Descriptor, ItemConfig } from '../interfaces';

const getCarver: (level: number, carvesLevel: number, desc?: Descriptor) => ItemConfig =
                 (level: number, carvesLevel: number, desc = Descriptor.Metal) => ({
  name: `Level ${level} Carver`,
  parts: [
    {
      name: 'Blade',
      descriptors: {
        [desc]: { level }
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

test('A level 1 carver should be able to carve a glass container', () => {

  const carver = getCarver(1, 1);

  const newContainer: ItemConfig = {
    name: 'Level 3 Glass',
    parts: [
      {
        name: 'Glass',
        descriptors: {
          [Descriptor.Glass]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Glass)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(hasFoundationalPart(result.newTarget)).toEqual(true);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toEqual(1);
});

test('A level 1 carver should be able to carve a leather container', () => {

  const carver = getCarver(1, 1);

  const newContainer: ItemConfig = {
    name: 'Level 3 Leather',
    parts: [
      {
        name: 'Leather',
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Leather)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(hasFoundationalPart(result.newTarget)).toEqual(true);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toEqual(1);
});

test('A level 1 glass carver should NOT be able to carve a leather container', () => {

  const carver = getCarver(1, 1, Descriptor.Glass);

  const newContainer: ItemConfig = {
    name: 'Level 3 Leather',
    parts: [
      {
        name: 'Leather',
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Leather)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(carver);
  expect(result.newTarget).toEqual(newContainer);
});

test('A level 1 carver should be able to carve a metal container', () => {

  const carver = getCarver(1, 1);

  const newContainer: ItemConfig = {
    name: 'Level 3 Metal',
    parts: [
      {
        name: 'Metal',
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Metal)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(hasFoundationalPart(result.newTarget)).toEqual(true);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toEqual(1);
});

test('A level 1 glass carver should NOT be able to carve a metal container', () => {

  const carver = getCarver(1, 1, Descriptor.Glass);

  const newContainer: ItemConfig = {
    name: 'Level 3 Metal',
    parts: [
      {
        name: 'Metal',
        descriptors: {
          [Descriptor.Metal]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Metal)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(carver);
  expect(result.newTarget).toEqual(newContainer);
});

test('A level 1 carver should be able to carve a rock container', () => {

  const carver = getCarver(1, 1);

  const newContainer: ItemConfig = {
    name: 'Level 3 Rock',
    parts: [
      {
        name: 'Rock',
        descriptors: {
          [Descriptor.Rock]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Rock)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(hasFoundationalPart(result.newTarget)).toEqual(true);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toEqual(1);
});

test('A level 1 glass carver should NOT be able to carve a rock container', () => {

  const carver = getCarver(1, 1, Descriptor.Glass);

  const newContainer: ItemConfig = {
    name: 'Level 3 Rock',
    parts: [
      {
        name: 'Rock',
        descriptors: {
          [Descriptor.Rock]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Rock)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(carver);
  expect(result.newTarget).toEqual(newContainer);
});

test('A level 1 carver should be able to carve a wood container', () => {

  const carver = getCarver(1, 1);

  const newContainer: ItemConfig = {
    name: 'Level 3 Wood',
    parts: [
      {
        name: 'Wood',
        descriptors: {
          [Descriptor.Wood]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Wood)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(hasFoundationalPart(result.newTarget)).toEqual(true);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toEqual(1);
});

test('A level 1 glass carver should NOT be able to carve a wood container', () => {

  const carver = getCarver(1, 1, Descriptor.Glass);

  const newContainer: ItemConfig = {
    name: 'Level 3 Wood',
    parts: [
      {
        name: 'Wood',
        descriptors: {
          [Descriptor.Wood]: { level: 3 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Carves, Descriptor.Wood)({
    sourceAction: Interaction.Carves,
    sourceItem: carver,
    targetItem: newContainer,
    targetPart: newContainer.parts[0]
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(carver);
  expect(result.newTarget).toEqual(newContainer);
});
