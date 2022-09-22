import { Card } from './card';

export enum Interaction {
  Buys = 'Buys',
  Carves = 'Carves',
  Corrodes = 'Corrodes',
  Freezes = 'Freezes',
  Heals = 'Heals',
  Ignites = 'Ignites',
  Smashes = 'Smashes',
  Tailors = 'Tailors',
  Unlocks = 'Unlocks',
  Wets = 'Wets',
  Zaps = 'Zaps'
}

export enum Descriptor {
  Blazing = 'Blazing',
  Bloody = 'Bloody',
  BodyArmor = 'BodyArmor',
  Bright = 'Bright',
  Clay = 'Clay',
  Cold = 'Cold',
  Combustible = 'Combustible',
  Container = 'Container',
  Cooked = 'Cooked',
  Corrosive = 'Corrosive',
  Dirt = 'Dirt',
  Electric = 'Electric',
  FeetArmor = 'FeetArmor',
  Fiber = 'Fiber',
  Frozen = 'Frozen',
  Glass = 'Glass',
  HeadArmor = 'HeadArmor',
  Hot = 'Hot',
  Kit = 'Kit',
  Leather = 'Leather',
  Locked = 'Locked',
  Magnetic = 'Magnetic',
  Meat = 'Meat',
  Metal = 'Metal',
  Mud = 'Mud',
  Rock = 'Rock',
  Rotten = 'Rotten',
  Sand = 'Sand',
  Sharp = 'Sharp',
  Slippery = 'Slippery',
  Sticky = 'Sticky',
  Throwable = 'Throwable',
  Unbreakable = 'Unbreakable',
  Wet = 'Wet',
  Wood = 'Wood'
}

export interface ItemPart {
  name: string;
  foundational?: boolean;
  primaryDescriptor: Descriptor;
  descriptors: Partial<Record<Descriptor, ItemDescriptor>>;
}

export interface ItemDescriptor {
  level?: number;
}

export interface ItemInteraction {
  name: Interaction;
  level?: number;
}

export interface ItemConfig extends Card {
  id?: string;
  parts: ItemPart[];
  interaction?: ItemInteraction;
}

export interface ReactionArgs {
  sourceItem: ItemConfig;
  targetItem: ItemConfig;
  sourcePart?: ItemPart;
  targetPart: ItemPart;
}

export interface ReactionExtendedArgs extends ReactionArgs {
  sourcePart: ItemPart;
};

export interface ReactionResponse {
  message: string;
  success?: boolean;
  newSource: ItemConfig;
  newTarget: ItemConfig;
  extraItems?: ItemConfig[];
}

export type ReactionFunction = (reaction: ReactionArgs) => ReactionResponse;

export type Reactions = Partial<Record<Descriptor, ReactionFunction>>;
