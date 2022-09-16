import { getInteractionLevel } from './helpers';
import { Descriptor, Interaction } from './interfaces';

test('Getting an interaction should return only the expected interaction', () => {
  const item = {
    name: `Level 1 Zapper`,
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

  expect(getInteractionLevel(item, Interaction.Zaps)).toBe(1);
  expect(getInteractionLevel(item, Interaction.Carves)).toBe(0);
});
