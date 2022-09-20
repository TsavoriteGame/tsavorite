import { addDescriptor, changePrimaryDescriptor, decreaseDescriptorLevel,
  decreaseDescriptorLevelForPart, decreaseInteractionLevel, getAllDescriptorsForPart, getCombinationBetweenTwoItems, getDescriptorLevel,
  getDescriptorLevelFromPart, getInteraction, getInteractionLevel, getPartWithDescriptor, hasDescriptor,
  hasFoundationalPart, increaseDescriptorLevel, increaseDescriptorLevelForPart, increaseInteractionLevel, setDescriptorLevelForPart,
  setFoundationalPart, setInteraction } from './helpers';
import { Descriptor, Interaction, ItemConfig } from './interfaces';
import { Ignites } from './reactions';

test('Setting an interaction should make sure it is at least level 0 and exists', () => {
  const item: ItemConfig = {
    name: 'Level 1 Pointless',
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

  setInteraction(item, Interaction.Carves);

  expect(item.interaction.name).toBe(Interaction.Carves);
  expect(item.interaction.level).toBe(0);
});

test('Getting an interaction should return only the expected interaction', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Electric]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(getInteraction(item, Interaction.Zaps)).toBeTruthy();
  expect(getInteraction(item, Interaction.Carves)).toBe(undefined);
  expect(getInteractionLevel(item, Interaction.Zaps)).toBe(1);
  expect(getInteractionLevel(item, Interaction.Carves)).toBe(0);
});

test('Getting a list of descriptors should return all valid descriptors', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Electric]: { level: 1 },
          [Descriptor.Unbreakable]: { level: 0 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  const descriptorsForPart = getAllDescriptorsForPart(item.parts[0]);
  expect(descriptorsForPart.length).toBe(2);
  expect(descriptorsForPart.includes(Descriptor.Metal)).toBe(true);
  expect(descriptorsForPart.includes(Descriptor.Electric)).toBe(true);
  expect(descriptorsForPart.includes(Descriptor.Unbreakable)).toBe(false);
});

test('Adding a descriptor should put it on the first part', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Electric]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  addDescriptor(item, Descriptor.Unbreakable, 1);

  expect(getDescriptorLevel(item, Descriptor.Unbreakable)).toBe(1);
});

test('Getting a descriptor level should take it from the first available part', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
          [Descriptor.Electric]: { level: 1 }
        }
      },
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 2 },
          [Descriptor.Electric]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(getDescriptorLevel(item, Descriptor.Metal)).toBe(1);
  expect(getDescriptorLevelFromPart(item.parts[1], Descriptor.Metal)).toBe(2);
});

test('Checking for a descriptor should check all available parts', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
        }
      },
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Electric,
        descriptors: {
          [Descriptor.Electric]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(hasDescriptor(item, Descriptor.Metal)).toBe(true);
  expect(hasDescriptor(item, Descriptor.Electric)).toBe(true);
});

test('Changing a primary descriptor should work', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 },
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(item.parts[0].primaryDescriptor).toBe(Descriptor.Metal);
  changePrimaryDescriptor(item.parts[0], Descriptor.Electric);
  expect(item.parts[0].primaryDescriptor).toBe(Descriptor.Electric);
});

test('Getting a part with descriptor should get the first available part', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      },
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Electric]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(getPartWithDescriptor(item, Descriptor.Metal)).toBe(item.parts[0]);
  expect(getPartWithDescriptor(item, Descriptor.Electric)).toBe(item.parts[1]);
});

test('Foundational parts/swapping should work', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      },
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Electric]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  expect(item.parts[0].foundational).toBeFalsy();
  expect(hasFoundationalPart(item)).toBeFalsy();

  setFoundationalPart(item.parts[0]);

  expect(item.parts[0].foundational).toBe(true);
  expect(hasFoundationalPart(item)).toBe(true);
});

test('Descriptor level setting should work', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  setDescriptorLevelForPart(item.parts[0], Descriptor.Unbreakable, 1);
  expect(getDescriptorLevel(item, Descriptor.Unbreakable)).toBe(1);

  increaseDescriptorLevelForPart(item.parts[0], Descriptor.Unbreakable, 1);
  expect(getDescriptorLevel(item, Descriptor.Unbreakable)).toBe(2);

  decreaseDescriptorLevelForPart(item.parts[0], Descriptor.Unbreakable, 1);
  expect(getDescriptorLevel(item, Descriptor.Unbreakable)).toBe(1);

  increaseDescriptorLevel(item, Descriptor.Blazing, 1);
  expect(getDescriptorLevel(item, Descriptor.Blazing)).toBe(1);

  decreaseDescriptorLevel(item, Descriptor.Blazing, 1);
  expect(getDescriptorLevel(item, Descriptor.Blazing)).toBe(0);
});

test('Descriptor level setting should work', () => {
  const item: ItemConfig = {
    name: 'Level 1 Zapper',
    parts: [
      {
        name: 'Baton',
        primaryDescriptor: Descriptor.Metal,
        descriptors: {
          [Descriptor.Metal]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Zaps, level: 1 }
  };

  increaseInteractionLevel(item, Interaction.Zaps, 1);
  expect(getInteractionLevel(item, Interaction.Zaps)).toBe(2);

  increaseInteractionLevel(item, Interaction.Carves, 1);
  expect(getInteractionLevel(item, Interaction.Carves)).toBe(0);

  decreaseInteractionLevel(item, Interaction.Zaps);
  expect(getInteractionLevel(item, Interaction.Zaps)).toBe(1);

  decreaseInteractionLevel(item, Interaction.Carves, 1);
  expect(getInteractionLevel(item, Interaction.Carves)).toBe(0);
});

test('Combining with a foundational source item should not work', () => {
  const sourceItem: ItemConfig = {
    name: 'Foundational Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        foundational: true,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const targetItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(false);

  expect(getDescriptorLevel(combination.newSource, Descriptor.Meat)).toEqual(1);
  expect(combination.newSource.parts[0].foundational).toBe(true);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(1);
});

test('Combining with a foundational target item should not work', () => {
  const sourceItem: ItemConfig = {
    name: 'Foundational Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const targetItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        foundational: true,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(false);

  expect(getDescriptorLevel(combination.newSource, Descriptor.Meat)).toEqual(1);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(1);
  expect(combination.newTarget.parts[0].foundational).toBe(true);
});

test('Combining items with multiple parts should not work', () => {
  const sourceItem: ItemConfig = {
    name: 'Compound Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      },
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 9 }
        }
      }
    ]
  };

  const targetItem: ItemConfig = {
    name: 'Compound Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      },
      {
        name: 'Sand',
        primaryDescriptor: Descriptor.Sand,
        descriptors: {
          [Descriptor.Sand]: { level: 9 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(false);

  expect(getDescriptorLevel(combination.newSource, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(combination.newSource, Descriptor.Sand)).toEqual(9);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(1);
  expect(getDescriptorLevel(combination.newTarget, Descriptor.Sand)).toEqual(9);
});

test('Combining items that can interact should not work', () => {
  const sourceItem: ItemConfig = {
    name: 'Flame',
    parts: [
      {
        name: 'Fire',
        primaryDescriptor: Descriptor.Hot,
        descriptors: {
          [Descriptor.Hot]: { level: 3 },
          [Descriptor.Blazing]: { level: 3 }
        }
      }
    ],
    interaction: {
      name: Interaction.Ignites,
      level: 3
    }
  };

  const targetItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(false);

  expect(getDescriptorLevel(combination.newSource, Descriptor.Hot)).toEqual(3);
  expect(getDescriptorLevel(combination.newSource, Descriptor.Blazing)).toEqual(3);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(1);
});

test('Combining mismatched items should not work', () => {
  const sourceItem: ItemConfig = {
    name: 'Goo',
    parts: [
      {
        name: 'Goo',
        primaryDescriptor: Descriptor.Sticky,
        descriptors: {
          [Descriptor.Sticky]: { level: 1 },
        }
      }
    ]
  };

  const targetItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(false);

  expect(getDescriptorLevel(combination.newSource, Descriptor.Sticky)).toEqual(1);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(1);
});

test('Combining matching items should work', () => {
  const sourceItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 2 }
        }
      }
    ]
  };

  const targetItem: ItemConfig = {
    name: 'Steak',
    parts: [
      {
        name: 'Steak',
        primaryDescriptor: Descriptor.Meat,
        descriptors: {
          [Descriptor.Meat]: { level: 1 }
        }
      }
    ]
  };

  const combination = getCombinationBetweenTwoItems(sourceItem, targetItem);

  expect(combination.success).toBe(true);

  expect(combination.newSource).toBe(undefined);

  expect(getDescriptorLevel(combination.newTarget, Descriptor.Meat)).toEqual(2);
});
