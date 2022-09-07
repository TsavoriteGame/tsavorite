
export enum Interaction {
  Carves = 'Carves',
  Freezes = 'Freezes',
  Ignites = 'Ignites',
  Smashes = 'Smashes',
  Unlocks = 'Unlocks',
  Wets = 'Wets',
  Zaps = 'Zaps'
}

export enum Descriptor {
  Bloody = 'Bloody',
  Bright = 'Bright',
  Cold = 'Cold',
  Combustible = 'Combustible',
  Container = 'Container',
  Cooked = 'Cooked',
  Dim = 'Dim',
  Dirt = 'Dirt',
  Dust = 'Dust',
  Electric = 'Electric',
  Fiber = 'Fiber',
  Frozen = 'Frozen',
  Glass = 'Glass',
  Hot = 'Hot',
  Leather = 'Leather',
  Locked = 'Lock',
  Magnetic = 'Magnetic',
  Meat = 'Meat',
  Metal = 'Metal',
  Rock = 'Rock',
  Rotten = 'Rotten',
  Sand = 'Sand',
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
  descriptors: Partial<Record<Descriptor, ItemDescriptor>>;
}

export interface ItemDescriptor {
  level?: number;
}

export interface ItemInteraction {
  name: Interaction;
  level?: number;
}

export interface ItemConfig {
  name: string;
  parts: ItemPart[];
  interaction?: ItemInteraction;
}

export interface ReactionArgs {
  sourceAction: Interaction;
  sourceItem: ItemConfig;
  targetItem: ItemConfig;
}

export interface ReactionExtendedArgs extends ReactionArgs {
  sourcePart: ItemPart;
  targetPart: ItemPart;
};

export interface ReactionResponse {
  message: string;
  success?: boolean;
  newSource: ItemConfig;
  newTarget: ItemConfig;
}

export type ReactionFunction = (reaction: ReactionArgs) => ReactionResponse;

export type Reactions = Partial<Record<Descriptor, ReactionFunction>>;
