import { ICard } from './card';

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

export interface IItemPart {
  name: string;
  foundational?: boolean;
  primaryDescriptor: Descriptor;
  descriptors: Partial<Record<Descriptor, IItemDescriptor>>;
}

export interface IItemDescriptor {
  level?: number;
}

export interface IItemInteraction {
  name: Interaction;
  level?: number;
}

export interface IItemConfig extends ICard {
  id?: string;
  parts: IItemPart[];
  interaction?: IItemInteraction;
  attacks?: string[];
}

export interface IReactionArgs {
  sourceItem: IItemConfig;
  targetItem: IItemConfig;
  sourcePart?: IItemPart;
  targetPart: IItemPart;
}

export interface IReactionExtendedArgs extends IReactionArgs {
  sourcePart: IItemPart;
};

export interface IReactionResponse {
  message: string;
  success?: boolean;
  newSource: IItemConfig;
  newTarget: IItemConfig;
  extraItems?: IItemConfig[];
}

export type ReactionFunction = (reaction: IReactionArgs) => IReactionResponse;

export type Reactions = Partial<Record<Descriptor, ReactionFunction>>;
