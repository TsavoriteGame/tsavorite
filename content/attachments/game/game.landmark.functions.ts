import { StateContext } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { pickBy } from 'lodash';
import { AddCardToLandmarkSlot, AddCardToPlayerSlot, LandmarkSlotTimerExpire,
  MakeChoice, PlayerSlotTimerExpire, RemoveCardFromLandmarkSlot, RemoveCardFromPlayerSlot,
  SetLandmarkSlotAttack, SetLandmarkSlotData, SetLandmarkSlotLock, SetLandmarkSlotTimer,
  SetPlayerSlotAttack, SetPlayerSlotData, SetPlayerSlotLock, SetPlayerSlotTimer } from '../../actions';
import { CardFunction, IGame, ILandmarkEncounter, ILandmarkSlot, ISlotFunctionOpts } from '../../interfaces';
import { identity } from '../../landmarks/helpers/all.helpers';
import { getEncounterOpts, isInGame } from './game.anonymous.functions';
import { cancelLandmark, updateLandmark } from './game.landmarkstate.functions';
import { getStore } from './game.store.functions';

import * as LandmarkInfo from '../../landmarks';
import { getServices } from './game.services.functions';

const allHelpers = pickBy(LandmarkInfo, (v, k) => k.toLowerCase().includes('helpers'));

export function makeChoice(ctx: StateContext<IGame>, { choice }: MakeChoice) {
  if(!isInGame(ctx)) {
    return;
  }

  const choices = ctx.getState().landmarkEncounter?.choices ?? [];
  const choiceRef = choices[choice];
  if(!choiceRef) {
    return;
  }

  cancelLandmark();

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  updateLandmark(ctx, choiceRef.callback(currentLandmark));
}

export function setLandmarkSlotLock(ctx: StateContext<IGame>, { slot, isLocked }: SetLandmarkSlotLock) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        locked: isLocked
      }))
    })
  }));
}

export function setLandmarkSlotTimer(ctx: StateContext<IGame>, { slot, timer, resetMaxTimer }: SetLandmarkSlotTimer) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        timer
      }))
    })
  }));

  if(resetMaxTimer) {
    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          maxTimer: timer
        }))
      })
    }));
  }
}

export function setLandmarkSlotAttack(ctx: StateContext<IGame>, { slot, attack }: SetLandmarkSlotAttack) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        selectedAttack: attack
      }))
    })
  }));
}

export function setLandmarkSlotData(ctx: StateContext<IGame>, { slot, data }: SetLandmarkSlotData) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.slots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        slotData: data
      }))
    })
  }));
}

export function removeCardFromLandmarkSlot(ctx: StateContext<IGame>, { slot }: RemoveCardFromLandmarkSlot) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.slots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        card: undefined
      }))
    })
  }));
}

export function landmarkSlotTimerExpire(ctx: StateContext<IGame>, { slot }: LandmarkSlotTimerExpire) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.slots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  cancelLandmark();

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  const newState = ctx.getState();
  const newLandmark = structuredClone(newState.landmarkEncounter);

  if(!newLandmark) {
    return;
  }

  const opts: ISlotFunctionOpts = {
    card: undefined,
    encounterOpts: getEncounterOpts(ctx),
    extraOpts: slotRef.timerExpiredOpts ?? {},
    landmarkEncounter: newLandmark,
    slotIndex: slot,
    store: getStore()
  };

  const funcName = slotRef.timerExpired;
  if(!funcName) {
    return;
  }

  const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
  if(!funcRef) {
    getServices().loggerService.error(`Could not find function ${funcName} (timerExpired) for landmark ${newLandmark.landmarkType}`);
  }

  const func: CardFunction = funcRef ?? identity;

  updateLandmark(ctx, func(opts));
}

export function addCardToLandmarkSlot(ctx: StateContext<IGame>, { slot, card }: AddCardToLandmarkSlot) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.slots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  cancelLandmark();

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        card
      }))
    })
  }));

  const newState = ctx.getState();
  const newLandmark = structuredClone(newState.landmarkEncounter);
  const newCard = structuredClone(card);

  if(!newLandmark) {
    return;
  }

  const opts: ISlotFunctionOpts = {
    card: newCard,
    encounterOpts: getEncounterOpts(ctx),
    extraOpts: slotRef.cardPlacedOpts ?? {},
    landmarkEncounter: newLandmark,
    slotIndex: slot,
    store: getStore()
  };

  const funcName = slotRef.cardPlaced;
  if(!funcName) {
    return;
  }

  const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
  if(!funcRef) {
    getServices().loggerService.error(`Could not find function ${funcName} (cardPlaced) for landmark ${newLandmark.landmarkType}`);
  }

  const func: CardFunction = funcRef ?? identity;

  updateLandmark(ctx, func(opts));
}

export function setPlayerSlotLock(ctx: StateContext<IGame>, { slot, isLocked }: SetPlayerSlotLock) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        locked: isLocked
      }))
    })
  }));
}

export function setPlayerSlotTimer(ctx: StateContext<IGame>, { slot, timer, resetMaxTimer }: SetPlayerSlotTimer) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        timer
      }))
    })
  }));

  if(resetMaxTimer) {
    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          maxTimer: timer
        }))
      })
    }));
  }
}

export function setPlayerSlotData(ctx: StateContext<IGame>, { slot, data }: SetPlayerSlotData) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        slotData: data
      }))
    })
  }));
}

export function setPlayerSlotAttack(ctx: StateContext<IGame>, { slot, attack }: SetPlayerSlotAttack) {
  if(!isInGame(ctx)) {
    return;
  }

  if(ctx.getState().landmarkEncounter.playerSlots.length === 0) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        selectedAttack: attack
      }))
    })
  }));
}

export function removeCardFromPlayerSlot(ctx: StateContext<IGame>, { slot }: RemoveCardFromPlayerSlot) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        card: undefined
      }))
    })
  }));
}

export function playerSlotTimerExpire(ctx: StateContext<IGame>, { slot }: PlayerSlotTimerExpire) {
  if(!isInGame(ctx)) {
    return;
  }

  const playerSlots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
  const slotRef = playerSlots[slot];
  if(!slotRef) {
    return;
  }

  cancelLandmark();

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  const newState = ctx.getState();
  const newLandmark = structuredClone(newState.landmarkEncounter);

  if(!newLandmark) {
    return;
  }

  const opts: ISlotFunctionOpts = {
    card: undefined,
    encounterOpts: getEncounterOpts(ctx),
    extraOpts: slotRef.timerExpiredOpts ?? {},
    landmarkEncounter: newLandmark,
    slotIndex: slot,
    store: getStore()
  };

  const funcName = slotRef.timerExpired;
  if(!funcName) {
    return;
  }

  const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
  if(!funcRef) {
    getServices().loggerService.error(`Could not find function ${funcName} (timerExpired) for player side ${newLandmark.landmarkType}`);
  }

  const func: CardFunction = funcRef ?? identity;

  updateLandmark(ctx, func(opts));
}

export function addCardToPlayerSlot(ctx: StateContext<IGame>, { slot, card }: AddCardToPlayerSlot) {
  if(!isInGame(ctx)) {
    return;
  }

  const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
  const slotRef = slots[slot];
  if(!slotRef) {
    return;
  }

  cancelLandmark();

  const currentLandmark = ctx.getState().landmarkEncounter;
  if(!currentLandmark) {
    return;
  }

  ctx.setState(patch<IGame>({
    landmarkEncounter: patch<ILandmarkEncounter>({
      playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
        card
      }))
    })
  }));

  const newState = ctx.getState();
  const newLandmark = structuredClone(newState.landmarkEncounter);
  const newCard = structuredClone(card);

  if(!newLandmark) {
    return;
  }

  const opts: ISlotFunctionOpts = {
    card: newCard,
    encounterOpts: getEncounterOpts(ctx),
    extraOpts: slotRef.cardPlacedOpts ?? {},
    landmarkEncounter: newLandmark,
    slotIndex: slot,
    store: getStore()
  };

  const funcName = slotRef.cardPlaced;
  if(!funcName) {
    return;
  }

  const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
  if(!funcRef) {
    getServices().loggerService.error(`Could not find function ${funcName} (cardPlaced) for player-side ${newLandmark.landmarkType}`);
  }

  const func: CardFunction = funcRef ?? identity;

  updateLandmark(ctx, func(opts));
}
