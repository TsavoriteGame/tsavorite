import { IMapPosition, IScenarioNode } from '../../../../../../../content/interfaces';
import { IGameSetup } from '../../stores/gamesetup.store';

export class PageLoad {
  static type = '[Options] Page Load';
  constructor() {}
}

export class StartGame {
  static type = '[Game] Start Game';
  constructor(public gameStartData: IGameSetup) {}
}

export class AbandonGame {
  static type = '[Game] Abandon Game';
  constructor() {}
}

export class ReplaceNode {
  static type = '[Game] Replace Node';
  constructor(public position: IMapPosition, public newNode: IScenarioNode) {}
}
