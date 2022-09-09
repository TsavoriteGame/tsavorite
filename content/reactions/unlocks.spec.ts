
import { getDescriptorLevel, getReactionBetweenTwoItems } from '../helpers';
import { Interaction, Descriptor, ItemConfig } from '../interfaces';

test('A level 2 key should unlock a level 1 lock', () => {

  const source: ItemConfig = {
    name: 'Level 2 Key',
    parts: [
      { name: 'Key', primaryDescriptor: Descriptor.Metal, descriptors: { [Descriptor.Metal]: { level: 1 } } }
    ],
    interaction: { name: Interaction.Unlocks, level: 2 }
  };

  const target: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toBe(undefined);
  expect(result.newTarget.parts.length).toBe(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Locked)).toBe(0);

});

test('An unbreakable level 2 key should unlock a level 1 lock and NOT break', () => {

  const source: ItemConfig = {
    name: 'Level 2 Key',
    parts: [{
      name: 'Orichalcum',
      primaryDescriptor: Descriptor.Unbreakable,
      descriptors: { [Descriptor.Unbreakable]: { level: 1 } }
    }],
    interaction: { name: Interaction.Unlocks, level: 2 }
  };

  const target: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget.parts.length).toBe(0);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Locked)).toBe(0);

});

test('A level 1 key should not unlock a level 2 lock', () => {

  const source: ItemConfig = {
    name: 'Level 1 Key',
    parts: [],
    interaction: { name: Interaction.Unlocks, level: 1 }
  };

  const target: ItemConfig = {
    name: 'Level 2 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Locked)).toBe(2);

});

test('A random item should not unlock a level 1 lock', () => {

  const source: ItemConfig = {
    name: 'Level 1 Not Key',
    parts: []
  };

  const target: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(source);
  expect(result.newTarget).toEqual(target);

});

test('A level 1 key should only unlock the first part of a compound lock', () => {

  const source: ItemConfig = {
    name: 'Level 1 Key',
    parts: [
      { name: 'Key', primaryDescriptor: Descriptor.Metal, descriptors: { [Descriptor.Metal]: { level: 1 } } }
    ],
    interaction: { name: Interaction.Unlocks, level: 1 }
  };

  const target: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      },
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Locked)).toBe(1);

});

test('A level 1 key should correctly interact with the lock on a door instead of the wood', () => {

  const source: ItemConfig = {
    name: 'Level 1 Key',
    parts: [
      { name: 'Key', primaryDescriptor: Descriptor.Metal, descriptors: { [Descriptor.Metal]: { level: 1 } } }
    ],
    interaction: { name: Interaction.Unlocks, level: 1 }
  };

  const target: ItemConfig = {
    name: 'Level 1 Door',
    parts: [
      {
        name: 'Wood Frame',
        primaryDescriptor: Descriptor.Wood,
        foundational: true,
        descriptors: {
          [Descriptor.Wood]: { level: 1 }
        }
      },
      {
        name: 'Lock Mechanism',
        primaryDescriptor: Descriptor.Locked,
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Wood)).toBe(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Locked)).toBe(0);

});
