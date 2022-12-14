import { getAllDescriptorsForPart, getDescriptorLevel, getInteractionLevel, getReactionBetweenTwoItems } from '../helpers';
import { Descriptor, Interaction, IItemConfig } from '../interfaces';

const getCorroder: (level: number, corrodesLevel: number) => IItemConfig =
                   (level: number, corrodesLevel: number) => ({
                     name: `Level ${level} Corroder`,
                     parts: [
                       {
                         name: 'Acid Flask',
                         primaryDescriptor: Descriptor.Corrosive,
                         descriptors: {
                           [Descriptor.Corrosive]: { level }
                         }
                       }
                     ],
                     interaction: { name: Interaction.Corrodes, level: corrodesLevel }
                   });

test('A level 2 corroder should combine with blood to make goo', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Bloody)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Sticky)).toEqual(1);
});

test('A level 2 corroder should turn level 1 blood into goo', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Sticky)).toEqual(1);
});

test('A level 2 corroder should partially dissolve level 2 clay', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Clay)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should fully dissolve level 1 clay', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Clay',
    parts: [
      {
        name: 'Clay',
        primaryDescriptor: Descriptor.Clay,
        descriptors: {
          [Descriptor.Clay]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should partially dissolve level 2 dirt', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Dirt)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should fully dissolve level 1 dirt', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Dirt',
    parts: [
      {
        name: 'Dirt',
        primaryDescriptor: Descriptor.Dirt,
        descriptors: {
          [Descriptor.Dirt]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should partially dissolve level 2 fiber', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Fiber)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should fully dissolve level 1 fiber', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should not affect normal glass', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 99 Glass',
    parts: [
      {
        name: 'Glass',
        primaryDescriptor: Descriptor.Glass,
        descriptors: {
          [Descriptor.Glass]: { level: 99 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
});

test('A level 2 corroder poured into a glass container should create an acid flask', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 3 Glass Bottle',
    parts: [
      {
        name: 'Glass Bottle',
        primaryDescriptor: Descriptor.Glass,
        foundational: true,
        descriptors: {
          [Descriptor.Glass]: { level: 3 },
          [Descriptor.Container]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].parts.length).toEqual(2);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Corrosive)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Glass)).toEqual(3);
});

test('A level 2 corroder should damage level 2 leather', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Leather)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should destroy level 1 leather', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should turn raw meat into rotten meat', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 99 Meat Slab',
    parts: [
      {
        name: 'Meat',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 99 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rotten)).toEqual(1);
});

test('A level 2 corroder should turn cooked meat into rotten meat', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 99 Ribeye Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 0 },
          [Descriptor.Cooked]: { level: 99 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Rotten)).toEqual(1);
});

test('A level 2 corroder should tarnish level 2 metal', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 2 Steel',
    parts: [
      {
        name: 'Steel',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Metal)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should destroy level 1 metal', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Steel',
    parts: [
      {
        name: 'Steel',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should partially dissolve level 2 mud', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 2 Mud',
    parts: [
      {
        name: 'Mud',
        primaryDescriptor: Descriptor.Mud,
        descriptors: {
          [Descriptor.Mud]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Mud)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(1);
});

test('A level 2 corroder should fully dissolve level 1 mud', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Mud',
    parts: [
      {
        name: 'Mud',
        primaryDescriptor: Descriptor.Mud,
        descriptors: {
          [Descriptor.Mud]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});

test('A level 2 corroder should reduce wetness', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Wet Rock',
    parts: [
      {
        name: 'Wet Rock',
        primaryDescriptor: Descriptor.Wet,
        foundational: true,
        descriptors: {
          [Descriptor.Rock]: { level: 99 },
          [Descriptor.Wet]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wet)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(2);
});

test('A level 2 corroder should rot level 2 wood', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
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

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Rotten)).toEqual(1);
  expect(getAllDescriptorsForPart(result.newTarget.parts[0]).length).toEqual(2);
});

test('A level 2 corroder should destroy level 1 rotten wood', () => {
  const source = getCorroder(1, 2);

  const target: IItemConfig = {
    name: 'Level 1 Rotten Wood',
    parts: [
      {
        name: 'Rotten Wood',
        primaryDescriptor: Descriptor.Wood,
        descriptors: {
          [Descriptor.Wood]: { level: 1 },
          [Descriptor.Rotten]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(getInteractionLevel(result.newSource, Interaction.Corrodes)).toEqual(1);

  expect(result.newTarget).toEqual(undefined);
});
