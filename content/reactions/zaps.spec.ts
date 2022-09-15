import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, ItemConfig } from '../interfaces';

const getZapper: (level: number, zapsLevel: number) => ItemConfig =
                 (level: number, zapsLevel: number) => ({
  name: `Level ${level} Zapper`,
  parts: [
    {
      name: 'Baton',
      primaryDescriptor: Descriptor.Metal,
      descriptors: {
        [Descriptor.Metal]: { level },
        [Descriptor.Electric]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Zaps, level: zapsLevel }
});

test('A level 2 zapper should magnetize metal', () => {

  const source = getZapper(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal',
    parts: [
      {
        name: 'Metal Rod',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Magnetic)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 zapper should not magnetize metal beyond its electric level', () => {

  const source = getZapper(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Metal',
    parts: [
      {
        name: 'Metal Rod',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Magnetic]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);

});

test('A level 2 zapper should not affect wood', () => {

  const source = getZapper(1, 2);

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

  expect(result.success).toBe(false);

});

test('A level 2 zapper should shock water', () => {

  const source = getZapper(1, 2);

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
  expect(getInteractionLevel(result.newSource, Interaction.Zaps)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Electric)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});
