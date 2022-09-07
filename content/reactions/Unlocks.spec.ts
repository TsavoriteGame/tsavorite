
import { Interaction, Descriptor, ItemConfig } from '../interfaces';
import { applications as UnlockApplications } from './Unlocks';

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

  const result = UnlockApplications[Descriptor.Locked]({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(true);
  expect(result.consumeSource).toBe(true);
  expect(result.consumeTarget).toBe(true);

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

  const result = UnlockApplications[Descriptor.Locked]({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(true);
  expect(result.consumeSource).toBe(false);
  expect(result.consumeTarget).toBe(true);

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

  const result = UnlockApplications[Descriptor.Locked]({
    sourceAction: Interaction.Unlocks,
    sourceItem: key,
    targetItem: lock
  });

  expect(result.success).toBe(false);
  expect(result.consumeSource).toBe(false);
  expect(result.consumeTarget).toBe(false);

});
