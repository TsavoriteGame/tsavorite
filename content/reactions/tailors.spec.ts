
import { getAllDescriptorsForPart, getDescriptorLevel,
  getInteractionLevel, getReactionBetweenTwoItems, hasFoundationalPart } from '../helpers';
import { Interaction, Descriptor, IItemConfig } from '../interfaces';

const getGlue = (glueLevel: number): IItemConfig => ({
  name: 'Glue',
  parts: [
    {
      name: 'Glue',
      primaryDescriptor: Descriptor.Sticky,
      descriptors: { [Descriptor.Sticky]: { level: glueLevel } }
    }
  ]
});

test('An empty kit should tailor nothing', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
});

test('An under-filled kit should tailor nothing', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Fiber]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(false);
});

test('A filled kit (3 leather, 1 fiber) should tailor a Leather Boots', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 3 },
          [Descriptor.Fiber]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Boots');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.FeetArmor)).toEqual(4);
});

test('A filled kit (5 leather, 2 fiber) should tailor a Leather Helmet', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 5 },
          [Descriptor.Fiber]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Helmet');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(5);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(2);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.HeadArmor)).toEqual(7);
});

test('A filled kit (7 leather, 3 fiber) should tailor a Leather Armor', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 7 },
          [Descriptor.Fiber]: { level: 3 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Armor');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(7);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.BodyArmor)).toEqual(10);
});

test('An over-filled kit (8 leather, 5 fiber) should tailor a Leather Armor and discard the surplus', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 8 },
          [Descriptor.Fiber]: { level: 5 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Armor');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(7);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(3);
});

test('A filled lv. 1 kit (7 leather, 3 fiber) should tailor a Leather Armor and break', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 1 },
          [Descriptor.Leather]: { level: 7 },
          [Descriptor.Fiber]: { level: 3 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 1 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource).toBe(undefined);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Armor');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(7);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(3);
});

test('A filled kit (7 leather, 3 fiber) should tailor a Leather Armor and break a lv.1 glue', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 7 },
          [Descriptor.Fiber]: { level: 3 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(1);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);

  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Armor');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(7);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(3);
});

test('A filled lv. 1 kit (7 leather, 3 fiber) should tailor a Leather Armor and break a lv.1 glue', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 1 },
          [Descriptor.Leather]: { level: 7 },
          [Descriptor.Fiber]: { level: 3 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 1 }
  };

  const target = getGlue(1);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource).toBe(undefined);

  expect(result.newTarget).toBe(undefined);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Armor');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(7);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(3);
});

test('A filled Hot Wet kit (3 leather, 1 fiber, should tailor a Hot Wet Leather Boots', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 3 },
          [Descriptor.Fiber]: { level: 1 },
          [Descriptor.Hot]: { level: 2 },
          [Descriptor.Wet]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Wet)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Boots');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.FeetArmor)).toEqual(4);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Hot)).toEqual(2);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Wet)).toEqual(2);
});

test('Using a tailor kit on lv.3 leather should destroy the leather item and add leather stacks to the kit', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target: IItemConfig = {
    name: 'Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 3 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(3);

  expect(result.newTarget).toBe(undefined);
});

test('Using a tailor kit on lv.3 hot leather should destroy the leather item and add leather stacks to the kit', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target: IItemConfig = {
    name: 'Leather',
    parts: [
      {
        name: 'Leather',
        primaryDescriptor: Descriptor.Leather,
        descriptors: {
          [Descriptor.Leather]: { level: 3 },
          [Descriptor.Hot]: { level: 2 }
        }
      }
    ]
  };

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(2);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(2);

  expect(result.newTarget).toBe(undefined);
});

test('A filled lv.1 Hot lv. 1 Cold kit (3 leather, 1 fiber, should tailor a Leather Boots', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 3 },
          [Descriptor.Fiber]: { level: 1 },
          [Descriptor.Hot]: { level: 1 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Boots');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Hot)).toEqual(0);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Cold)).toEqual(0);
});

test('A filled lv.2 Hot lv. 1 Cold kit (3 leather, 1 fiber, should tailor a lv.1 Hot Leather Boots', () => {
  const source: IItemConfig = {
    name: 'Kit',
    parts: [
      {
        name: 'Kit',
        primaryDescriptor: Descriptor.Kit,
        descriptors: {
          [Descriptor.Kit]: { level: 2 },
          [Descriptor.Leather]: { level: 3 },
          [Descriptor.Fiber]: { level: 1 },
          [Descriptor.Hot]: { level: 2 },
          [Descriptor.Cold]: { level: 1 }
        }
      }
    ],
    interaction: { name: Interaction.Tailors, level: 2 }
  };

  const target = getGlue(2);

  const result = getReactionBetweenTwoItems(source, target);

  expect(result.success).toBe(true);

  expect(result.newSource.parts.length).toEqual(1);
  expect(getInteractionLevel(result.newSource, Interaction.Tailors)).toEqual(1);
  expect(getDescriptorLevel(result.newSource, Descriptor.Leather)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Fiber)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Hot)).toEqual(0);
  expect(getDescriptorLevel(result.newSource, Descriptor.Cold)).toEqual(0);

  expect(result.newTarget.parts.length).toEqual(1);
  expect(getDescriptorLevel(result.newTarget, Descriptor.Sticky)).toEqual(1);

  expect(result.extraItems.length).toEqual(1);
  expect(result.extraItems[0].name).toEqual('Leather Boots');
  expect(result.extraItems[0].parts.length).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Leather)).toEqual(3);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Fiber)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Hot)).toEqual(1);
  expect(getDescriptorLevel(result.extraItems[0], Descriptor.Cold)).toEqual(0);
});
