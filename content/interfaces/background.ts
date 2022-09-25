
export interface IBackgroundKitItem {
  description: string;
  icon: string;
  itemId: string;
  itemChanges: Record<string, number>;
}

export interface IBackground {
  name: string;
  icon: string;
  disabled?: boolean;
  realName: string;
  hp: number;
  description: string;
  archetype: string;
  goal: string;
  startingKit: IBackgroundKitItem[];
}
