
export enum Keybind {
  Pause = 'Pause',
  MoveUp = 'MoveUp',
  MoveDown = 'MoveDown',
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  Choice1 = 'Choice1',
  Choice2 = 'Choice2',
  Choice3 = 'Choice3',
  Choice4 = 'Choice4'
}

export enum GameOption {
  IsPaused = 'isPaused',
  MasterVolume = 'masterVolume',
  IsFantasyFont = 'isFantasyFont',
  IsDebugMode = 'isDebugMode',
  Keymap = 'keymap',
  GameSpeed = 'gameSpeed',
  ShowDebugInfo = 'showDebugInfo',
}

export interface IOptions {
  version: number;
  [GameOption.IsPaused]: boolean;
  [GameOption.MasterVolume]: number;
  [GameOption.IsFantasyFont]: boolean;
  [GameOption.IsDebugMode]: boolean;
  [GameOption.Keymap]: Record<Keybind, [string, string]>;
  [GameOption.GameSpeed]: number;
}
