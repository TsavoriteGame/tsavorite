
export interface BackgroundKitItem {
  description: string;
  item: string;
  changes: Record<string, number>;
}

export interface Background {
  name: string;
  realName: string;
  description: string;
  archetype: string;
  goal: string;
  startingKit: BackgroundKitItem[];
}
