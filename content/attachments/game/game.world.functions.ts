import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { IncrementStatistic, Move, Warp } from '../../actions';
import { GameStatistic, IGame, IMapPosition } from '../../interfaces';
import { findFirstLandmarkInWorld } from '../../scenario.helpers';
import { handleCurrentTile, isInGame, moveOtherEntities } from './game.anonymous.functions';
import { cancelLandmark } from './game.landmarkstate.functions';
import { getStore } from './game.store.functions';


export function move(ctx: StateContext<IGame>, { xDelta, yDelta }: Move) {
  if(!isInGame(ctx)) {
    return;
  }

  // characters can only move one tile at a time
  if(xDelta > 1 || xDelta < -1 || yDelta > 1 || yDelta < -1) {
    return;
  }

  // if the character is stuck and tries to move in any direction that isn't 0,0 (the same tile), do nothing
  if(ctx.getState().character?.stuck && (xDelta !== 0 || yDelta !== 0)) {
    return;
  }

  moveOtherEntities(ctx);

  const { worldId, x, y } = ctx.getState().position;

  const targetNodeRef = ctx.getState().scenario.worlds[worldId].layout[y + yDelta]?.[x + xDelta];
  if(!targetNodeRef) {
    return;
  }

  let targetNode = targetNodeRef;
  if(targetNodeRef.id !== -1) {
    targetNode = ctx.getState().scenario.nodes[targetNodeRef.id];
  }

  if(targetNode.blockMovement) {
    return;
  }

  ctx.setState(patch<IGame>({
    position: patch<IMapPosition>({
      x: x + xDelta,
      y: y + yDelta
    })
  }));

  if(xDelta !== 0 || yDelta !== 0) {
    ctx.patchState({ currentStep: ctx.getState().currentStep + 1 });
    getStore().dispatch(new IncrementStatistic(GameStatistic.StepsTaken, 1));
  }

  cancelLandmark();
  handleCurrentTile(ctx);
}

export function warp(ctx: StateContext<IGame>, { scenario, warpToWorld, warpToLandmark }: Warp) {
  if(!isInGame(ctx)) {
    return;
  }

  const nodePosition = findFirstLandmarkInWorld(scenario, warpToWorld, warpToLandmark);

  ctx.setState(patch<IGame>({
    position: patch<IMapPosition>({
      ...nodePosition
    })
  }));

  cancelLandmark();
  handleCurrentTile(ctx);
}
