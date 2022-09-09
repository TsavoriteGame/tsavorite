import { shouldItemBreakWhenInteractingWith } from './helpers';
import { Descriptor, ItemConfig } from './interfaces';

const itemWithDescriptorAtLevel: (descriptor: Descriptor, level: number) => ItemConfig = (descriptor: Descriptor, level: number) => ({
  name: `${descriptor} Item`,
  parts: [
    {
      name: descriptor,
      primaryDescriptor: descriptor,
      descriptors: {
        [descriptor]: { level }
      }
    }
  ]
});

test('Glass breaks on everything', () => {
  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Glass, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Wood, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Rock, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Metal, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);
});

test('Wood breaks on rock/metal/unbreakable', () => {
  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Glass, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Wood, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Rock, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Metal, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);
});

test('Rock breaks on metal/unbreakable', () => {
  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Glass, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Wood, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Rock, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Metal, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);
});

test('Metal breaks on stronger metal/unbreakable', () => {
  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Glass, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Wood, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Rock, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Metal, 1)
  )).toBe(false);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Metal, 2)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);
});

test('Anything breaks when hitting unbreakable (except unbreakable)', () => {
  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Glass, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Wood, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Rock, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Metal, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(true);

  expect(shouldItemBreakWhenInteractingWith(
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1),
    itemWithDescriptorAtLevel(Descriptor.Unbreakable, 1)
  )).toBe(false);
});
