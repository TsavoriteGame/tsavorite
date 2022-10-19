import { StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { setDiscordRPCStatus } from '../../../src/app/core/services/game/discord';
import { ReplaceNode, SetCurrentCardId, StartGame } from '../../actions';
import { getScenarioByName } from '../../getters';
import { EquipmentSlot, IGame, IGameCharacter, IScenario, IScenarioNode, IScenarioWorld } from '../../interfaces';
import { findSpawnCoordinates } from '../../scenario.helpers';
import { isInGame } from './game.anonymous.functions';
import { defaultGame } from './game.functions';
import { getServices } from './game.services.functions';
import { move } from './game.world.functions';

export function pageLoad(ctx: StateContext<IGame>) {
  ctx.setState(patch<IGame>({
    landmarkEncounter: undefined,
  }));

  if(ctx.getState().character) {
    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        stuck: false
      })
    }));
  }
}

export function startGame(ctx: StateContext<IGame>, { gameStartData }: StartGame) {
  const { chosenBackground } = gameStartData;
  const { contentService, loggerService } = getServices();

  const background = contentService.getBackground(chosenBackground);
  if(!background) {
    loggerService.error('Background does not exist; game cannot start.');
    return;
  }

  const archetype = contentService.getArchetype(background.archetype);
  if(!archetype) {
    loggerService.error('Archetype does not exist; game cannot start.');
    return;
  }

  ctx.patchState({ currentCardId: 0 });
  contentService.setCurrentCardId(0);

  const character: IGameCharacter = {
    name: background.realName,
    hp: background.hp,
    body: background.body,
    background,
    archetype,
    items: [],
    equipment: {
      [EquipmentSlot.Head]: undefined,
      [EquipmentSlot.Hands]: undefined,
      [EquipmentSlot.Body]: undefined,
      [EquipmentSlot.Feet]: undefined
    },
    powers: [
      undefined,
      undefined,
    ],
    stuck: false,
    disallowHealthUpdates: false,
    chosenAttack: 'Attack'
  };

  background.startingKit.forEach(kitItem => {
    const item = contentService.reformatItem(kitItem.itemId, kitItem.itemChanges);
    if(!item) {
      loggerService.error(`Could not find item ${kitItem.itemId} for starting kit.`);
      return;
    }

    character.items.push(item);
  });

  const scenario = getScenarioByName('Test');
  const position = findSpawnCoordinates(scenario);

  ctx.patchState({ character, scenario, position });

  setDiscordRPCStatus({
    isInGame: true,
    isMakingCharacter: false,
    background: background.name,
    playerName: character.name
  });

  move(ctx, { xDelta: 0, yDelta: 0 });
};

export function setCurrentCardId(ctx: StateContext<IGame>, { cardId }: SetCurrentCardId) {
  ctx.setState(patch<IGame>({
    currentCardId: cardId
  }));
}

export function abandonGame(ctx: StateContext<IGame>) {
  setDiscordRPCStatus({
    isInGame: false,
    isMakingCharacter: false,
    background: '',
    playerName: ''
  });

  ctx.setState(defaultGame());
}

export function replaceNode(ctx: StateContext<IGame>, { position, newNode }: ReplaceNode) {
  if(!isInGame(ctx)) {
    return;
  }

  newNode.id = -1;

  ctx.setState(patch<IGame>({
    scenario: patch<IScenario>({
      worlds: patch<Record<number, IScenarioWorld>>({
        [position.worldId]: patch<IScenarioWorld>({
          layout: updateItem<IScenarioNode[]>(position.y, updateItem<IScenarioNode>(position.x, newNode))
        })
      })
    })
  }));

}
