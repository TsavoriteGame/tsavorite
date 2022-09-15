import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, ItemConfig } from '../interfaces';

const getFreezer: (level: number, freezeLevel: number) => ItemConfig =
                  (level: number, freezeLevel: number) => ({
  name: `Level ${level} Freezer`,
  parts: [
    {
      name: 'Freezer',
      primaryDescriptor: Descriptor.Cold,
      descriptors: {
        [Descriptor.Cold]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Freezes, level: freezeLevel }
});

test('A level 2 freezer should chill level 2 blood', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Blood',
    parts: [
      {
        name: 'Blood',
        primaryDescriptor: Descriptor.Bloody,
        descriptors: {
          [Descriptor.Bloody]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 freezer should freeze level 1 frozen blood', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Blood',
    parts: [
      {
        name: 'Blood',
        primaryDescriptor: Descriptor.Bloody,
        descriptors: {
          [Descriptor.Bloody]: { level: 1 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should chill glass', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 freezer should shatter hot glass', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 1 },
          [Descriptor.Hot]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

});

test('A level 2 freezer should lower heat on a hot rock but not impart cold', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Heatstone',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Hot,
        descriptors: {
          [Descriptor.Rock]: { level: 1 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 freezer should chill level 2 meat', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(2);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 freezer should freeze chilled level 1 meat', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Meat',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should make metal sticky', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal Pole',
    parts: [
      {
        name: 'Metal Pole',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should make a rock cold', () => {

  const source = getFreezer(1, 2);

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

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 freezer should chill level 1 water', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Water',
    parts: [
      {
        name: 'Water',
        primaryDescriptor: Descriptor.Wet,
        descriptors: {
          [Descriptor.Wet]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should freeze chilled level 1 water', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Water',
    parts: [
      {
        name: 'Water',
        primaryDescriptor: Descriptor.Wet,
        descriptors: {
          [Descriptor.Wet]: { level: 1 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should lower brightness on blazing', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Fire',
    parts: [
      {
        name: 'Fire',
        primaryDescriptor: Descriptor.Blazing,
        descriptors: {
          [Descriptor.Blazing]: { level: 2 },
          [Descriptor.Hot]: { level: 2 },
          [Descriptor.Bright]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Blazing)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bright)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);

});

test('A level 2 freezer should turn mud into rock', () => {

  const source = getFreezer(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Mud',
    parts: [
      {
        name: 'Mud',
        primaryDescriptor: Descriptor.Mud,
        descriptors: {
          [Descriptor.Mud]: { level: 1 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rock)).toEqual(1);

});
