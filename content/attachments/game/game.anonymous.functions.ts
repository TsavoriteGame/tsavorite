import { StateContext } from '@ngxs/store';
import { shuffle, isUndefined, pickBy } from 'lodash';
import { EquipmentSlot, GameConstant, IGame, IGameCharacter, ILandmark } from '../../interfaces';
import { nothing } from '../../landmarks/helpers/nothing.helpers';
import { getNodeAt } from '../../scenario.helpers';
import { resetEventLog } from './game.eventlog.functions';
import { replaceNode } from './game.misc.functions';

import * as LandmarkInfo from '../../landmarks';
import { updateLandmark } from './game.landmarkstate.functions';
import { getCallbacks } from './game.callbacks.functions';
import { getStore } from './game.store.functions';

const allLandmarks = pickBy(LandmarkInfo, (v, k) => !k.toLowerCase().includes('helpers'));

export function isInGame(ctx: StateContext<IGame>) {
  return !!ctx.getState().character;
}

export function getEncounterOpts(ctx: StateContext<IGame>) {
  const { scenario, position, character } = ctx.getState();
  const node = getNodeAt(scenario, position.worldId, position.x, position.y);

  const encounterOpts = {
    scenario: structuredClone(scenario),
    position: structuredClone(position),
    scenarioNode: structuredClone(node),
    character: structuredClone(character),
    callbacks: getCallbacks()
  };

  return encounterOpts;
}

export function findCharacterEquipmentSlotWithCardId(character: IGameCharacter, cardId: number): EquipmentSlot | undefined {
  return Object.keys(character.equipment).find(slot => character.equipment[slot]?.cardId === cardId) as EquipmentSlot;
}

export function getMovableEntities(ctx: StateContext<IGame>) {
  const scenario = ctx.getState().scenario;
  return Object.keys(scenario.worlds)
    .map(worldId => {
      const world = scenario.worlds[worldId];

      const nodes = [];

      for(let y = 0; y < world.layout.length; y++) {
        for(let x = 0; x < world.layout[y].length; x++) {
          const node = getNodeAt(scenario, +worldId, x, y);
          if(!node.landmarkData.moveInterval) {
            continue;
          }

          nodes.push({
            worldId: +worldId,
            x,
            y,
            node
          });
        }
      }

      return nodes;
    })
    .flat();
}

export function moveOtherEntities(ctx: StateContext<IGame>) {
  const movableEntities = getMovableEntities(ctx);
  const currentStep = ctx.getState().currentStep ?? 0;

  const currentPosition = ctx.getState().position;

  movableEntities.forEach(entity => {
    const { moveInterval, moveSteps } = entity.node.landmarkData;

    // only attempt to move when the interval is up
    if(currentStep % moveInterval !== 0) {
      return;
    }

    // if the player is here, don't move
    if(entity.worldId === currentPosition.worldId
    && entity.x === currentPosition.x
    && entity.y === currentPosition.y) {
      return;
    }

    for(let i = 0; i < moveSteps; i++) {
      const { worldId, x, y } = entity;

      const allDirections = shuffle([
        { x: 0,  y: -1 },
        { x: 0,  y: 1 },
        { x: -1, y: 0 },
        { x: 1,  y: 0 }
      ]);

      let didMove = false;

      allDirections.forEach(dir => {
        if(didMove) {
          return;
        }

        // check if we can move to the tile - there must be something there, it can't block movement
        // it can't be Nothing, and it can't be where the player is
        const newTile = getNodeAt(ctx.getState().scenario, worldId, x + dir.x, y + dir.y);
        if(!newTile
        || newTile.blockMovement
        || newTile.landmark !== 'Nothing'
        || (x + dir.x === currentPosition.x && y + dir.y === currentPosition.y && worldId === currentPosition.worldId)) {
          return;
        }

        // swap the nodes
        replaceNode(ctx, { position: { worldId, x, y }, newNode: nothing() });
        replaceNode(ctx, { position: { worldId, x: x + dir.x, y: y + dir.y }, newNode: structuredClone(entity.node) });

        // only one move per step
        didMove = true;
      });
    }
  });
}

export function handleCurrentTile(ctx: StateContext<IGame>) {

  const { scenario, position } = ctx.getState();
  const node = getNodeAt(scenario, position.worldId, position.x, position.y);

  const { landmark } = node;

  // handle landmark
  if(!isUndefined(landmark)) {
    const landmarkRef = allLandmarks[landmark];
    if(!landmarkRef) {
      return;
    }

    const landmarkInstance: ILandmark = new landmarkRef(getStore());

    const encounterOpts = getEncounterOpts(ctx);

    resetEventLog(ctx);
    updateLandmark(ctx, landmarkInstance.encounter(encounterOpts));
  }

}

export function getConstant(constant: GameConstant): any {
  const gameConstants: Record<GameConstant, any> = {
    [GameConstant.BackpackSize]: 16,
    [GameConstant.PlayerSlots]: 4,
    [GameConstant.LandmarkSlots]: 4,
  };

  return gameConstants[constant];
}
