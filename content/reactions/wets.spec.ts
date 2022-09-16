import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, ItemConfig } from '../interfaces';

const getWetter: (level: number, wetsLevel: number) => ItemConfig =
                 (level: number, wetsLevel: number) => ({
  name: `Level ${level} Wetter`,
  parts: [
    {
      name: 'Bucket of Water',
      primaryDescriptor: Descriptor.Wet,
      descriptors: {
        [Descriptor.Wet]: { level }
      }
    }
  ],
  interaction: { name: Interaction.Wets, level: wetsLevel }
});

test('A level 2 wetter should make blood wetter', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
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

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);

});

test('A level 2 wetter should make cold colder', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Cold',
    parts: [
      {
        name: 'Cold',
        primaryDescriptor: Descriptor.Cold,
        descriptors: {
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toBe(2);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 2 wetter should lower the combustability of an item', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Combustible',
    parts: [
      {
        name: 'Combustible',
        primaryDescriptor: Descriptor.Combustible,
        descriptors: {
          [Descriptor.Combustible]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Combustible)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 2 wetter should make wet a completely damp combustible', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Combustible',
    parts: [
      {
        name: 'Combustible',
        primaryDescriptor: Descriptor.Combustible,
        descriptors: {
          [Descriptor.Combustible]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Combustible)).toBe(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);

});

test('A level 2 wetter should dilute a corrosive item', () => {
  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Corrosive',
    parts: [
      {
        name: 'Corrosive',
        primaryDescriptor: Descriptor.Corrosive,
        descriptors: {
          [Descriptor.Corrosive]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Corrosive)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);
});

test('A level 2 wetter should fully dilute a pale corrosive item', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 1 Corrosive',
    parts: [
      {
        name: 'Corrosive',
        primaryDescriptor: Descriptor.Corrosive,
        descriptors: {
          [Descriptor.Corrosive]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Corrosive)).toBe(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(1);

});

test('A level 2 wetter should make dirt more muddy', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Dirt',
    parts: [
      {
        name: 'Dirt',
        primaryDescriptor: Descriptor.Dirt,
        descriptors: {
          [Descriptor.Dirt]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Dirt)).toBe(1);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Mud)).toBe(1);
  expect(getAllDescriptorsForPart(result.extraItems[0].parts[0]).length).toBe(2);

});

test('A level 2 wetter should become electric when electrifying something', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Electric',
    parts: [
      {
        name: 'Electric',
        primaryDescriptor: Descriptor.Electric,
        descriptors: {
          [Descriptor.Electric]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Electric)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make a frozen item become sticky and more frozen', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Frozen',
    parts: [
      {
        name: 'Frozen',
        primaryDescriptor: Descriptor.Frozen,
        descriptors: {
          [Descriptor.Frozen]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Cold)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Frozen)).toBe(3);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make something hot less hot', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Hot',
    parts: [
      {
        name: 'Hot',
        primaryDescriptor: Descriptor.Hot,
        descriptors: {
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Hot)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(1);
});

test('A level 2 wetter should make leather wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Leather',
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
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Leather)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make glass wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Glass',
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
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make clay wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Clay',
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
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Clay)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make meat wet', () => {

  const source = getWetter(1, 2);

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
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Meat)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make metal wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Metal',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make rock wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Rock',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should make sand more wet', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Sand',
    parts: [
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sand)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make wet sand into mud', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Sand',
    parts: [
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 2 },
          [Descriptor.Wet]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toBe(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Mud)).toBe(2);
});

test('A level 2 wetter should make slippery more wet and slippery', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Slippery',
    parts: [
      {
        name: 'Slippery',
        primaryDescriptor: Descriptor.Slippery,
        descriptors: {
          [Descriptor.Slippery]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(3);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make wet more wet and slippery', () => {

  const source = getWetter(1, 2);

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
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(3);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Slippery)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make wood more wet', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toBe(2);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(2);
});

test('A level 2 wetter should make wet wood rotten', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 2 },
          [Descriptor.Wet]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(3);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rotten)).toBe(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toBe(3);
});

test('A level 2 wetter should collapse rotten wood', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Wood',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 1 },
          [Descriptor.Wet]: { level: 1 },
          [Descriptor.Rotten]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(result.newTarget).toBe(undefined);
});

test('A level 2 wetter should add water to a clay container', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Clay Container',
    parts: [
      {
        name: 'Clay',
        primaryDescriptor: Descriptor.Clay,
        descriptors: {
          [Descriptor.Clay]: { level: 1 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Clay)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toBe(1);
});

test('A level 2 wetter should add water to a glass container', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Glass Container',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 1 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Glass)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toBe(1);
});

test('A level 2 wetter should add water to a metal container', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Metal Container',
    parts: [
      {
        name: 'Metal',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toBe(1);
});

test('A level 2 wetter should add water to a rock container', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Rock Container',
    parts: [
      {
        name: 'Rock',
        primaryDescriptor: Descriptor.Rock,
        descriptors: {
          [Descriptor.Rock]: { level: 1 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rock)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toBe(1);
});

test('A level 2 wetter should add water to a wood container', () => {

  const source = getWetter(1, 2);

  const target: ItemConfig = {
    name: 'Level 2 Wood Container',
    parts: [
      {
        name: 'Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 1 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(getInteractionLevel(result.newSource, Interaction.Wets)).toBe(1);

  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rotten)).toBe(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Container)).toBe(1);
});



