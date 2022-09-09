import { getDescriptorLevel, getInteractionLevel, getReaction, shouldShatter } from '../helpers';
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

test('A level 2 freezer should chill level 1 blood', () => {

  const freezer = getFreezer(1, 2);

  const blood: ItemConfig = {
    name: 'Level 1 Blood',
    parts: [
      {
        name: 'Blood',
        primaryDescriptor: Descriptor.Bloody,
        descriptors: {
          [Descriptor.Bloody]: { level: 1 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Freezes, Descriptor.Bloody)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: blood,
    targetPart: blood.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);

});

test('A level 2 freezer should freeze level 1 frozen blood', () => {

  const freezer = getFreezer(1, 2);

  const blood: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Bloody)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: blood,
    targetPart: blood.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);

});

test('A level 2 freezer should chill glass', () => {

  const freezer = getFreezer(1, 2);

  const glass: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Glass)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: glass,
    targetPart: glass.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);

});

test('A level 2 freezer should shatter hot glass', () => {

  const freezer = getFreezer(1, 2);

  const glass: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Glass)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: glass,
    targetPart: glass.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

});

test('A level 2 freezer should lower heat on a hot rock but not impart cold', () => {

  const freezer = getFreezer(1, 2);

  const rock: ItemConfig = {
    name: 'Level 1 Rock',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 1 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Freezes, Descriptor.Hot)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: rock,
    targetPart: rock.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);

});

test('A level 2 freezer should lower heat on a hot rock and lower freeze on source', () => {

  const freezer = getFreezer(1, 2);

  const rock: ItemConfig = {
    name: 'Level 1 Rock',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 1 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Freezes, Descriptor.Hot)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: rock,
    targetPart: rock.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toEqual(1);

});

test('A level 2 freezer should chill level 1 meat', () => {

  const freezer = getFreezer(1, 2);

  const meat: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Meat)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);

});

test('A level 2 freezer should freeze chilled level 1 meat', () => {

  const freezer = getFreezer(1, 2);

  const meat: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Meat)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: meat,
    targetPart: meat.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);

});

test('A level 2 freezer should make metal sticky', () => {

  const freezer = getFreezer(1, 2);

  const pole: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Metal)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: pole,
    targetPart: pole.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

});

test('A level 2 freezer should make a rock cold', () => {

  const freezer = getFreezer(1, 2);

  const rock: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Metal)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: rock,
    targetPart: rock.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toEqual(1);

});

test('A level 2 freezer should chill level 1 water', () => {

  const freezer = getFreezer(1, 2);

  const water: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Wet)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: water,
    targetPart: water.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);

});

test('A level 2 freezer should freeze chilled level 1 water', () => {

  const freezer = getFreezer(1, 2);

  const water: ItemConfig = {
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

  const result = getReaction(Interaction.Freezes, Descriptor.Wet)({
    sourceAction: Interaction.Freezes,
    sourceItem: freezer,
    targetItem: water,
    targetPart: water.parts[0]
  });

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Freezes)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toEqual(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);

});
