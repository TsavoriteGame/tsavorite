
import { getReaction } from '../helpers';
import { Interaction, Descriptor, ItemConfig } from '../interfaces';

test('A level 2 key should unlock a level 1 lock', () => {

  const key: ItemConfig = {
    name: 'Level 2 Key',
    parts: [],
    interaction: { name: Interaction.Unlocks, level: 2 }
  };

  const lock: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Unlocks, Descriptor.Locked)({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toBe(undefined);
  expect(result.newTarget.parts.length).toBe(0);

});

test('An unbreakable level 2 key should unlock a level 1 lock and NOT break', () => {

  const key: ItemConfig = {
    name: 'Level 2 Key',
    parts: [{ name: 'Orichalcum', descriptors: { [Descriptor.Unbreakable]: { level: 1 } } }],
    interaction: { name: Interaction.Unlocks, level: 2 }
  };

  const lock: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Unlocks, Descriptor.Locked)({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(key);
  expect(result.newTarget.parts.length).toBe(0);

});

test('A level 1 key should not unlock a level 2 lock', () => {

  const key: ItemConfig = {
    name: 'Level 1 Key',
    parts: [],
    interaction: { name: Interaction.Unlocks, level: 1 }
  };

  const lock: ItemConfig = {
    name: 'Level 2 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 2 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Unlocks, Descriptor.Locked)({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(key);
  expect(result.newTarget).toEqual(lock);

});

test('A random item should not unlock a level 1 lock', () => {

  const key: ItemConfig = {
    name: 'Level 1 Not Key',
    parts: []
  };

  const lock: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Unlocks, Descriptor.Locked)({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(false);
  expect(result.newSource).toEqual(key);
  expect(result.newTarget).toEqual(lock);

});

test('A level 1 key should only unlock the first part of a compound lock', () => {

  const key: ItemConfig = {
    name: 'Level 1 Key',
    parts: [],
    interaction: { name: Interaction.Unlocks, level: 1 }
  };

  const lock: ItemConfig = {
    name: 'Level 1 Lock',
    parts: [
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      },
      {
        name: 'Lock Mechanism',
        descriptors: {
          [Descriptor.Locked]: { level: 1 }
        }
      }
    ]
  };

  const result = getReaction(Interaction.Unlocks, Descriptor.Locked)({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(true);
  expect(result.newSource).toEqual(undefined);
  expect(result.newTarget.parts.length).toBe(1);

});
