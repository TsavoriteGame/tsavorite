import { IAttachment } from '../../interfaces';
import { AbandonGame, AddBackpackItem, AddCardToLandmarkSlot, AddCardToPlayerSlot, AddCoinsToBackpack,
  AddEventLogMessage, AddHealth, ChangeAttack, EncounterCurrentTile, LandmarkSlotTimerExpire, MakeChoice,
  Move, PageLoad, PlayerSlotTimerExpire, ReduceHealth, RemoveCardFromLandmarkSlot, RemoveCardFromPlayerSlot,
  RemoveCharacterItemById, RemoveCoinsFromBackpack, ReplaceNode, ResetEventLog, SetCharacterItemLockById,
  SetCurrentCardId, SetEquipmentItem, SetHealth, SetLandmarkSlotAttack, SetLandmarkSlotData, SetLandmarkSlotLock,
  SetLandmarkSlotTimer, SetPlayerSlotAttack, SetPlayerSlotData, SetPlayerSlotLock, SetPlayerSlotTimer,
  StartGame, UpdateCharacterItemById, UpdateCharacterPrimaryInformation, Warp } from '../../actions';
import { abandonGame, pageLoad, replaceNode, setCurrentCardId, startGame } from './game.misc.functions';
import { move, warp } from './game.world.functions';
import { addEventLogMessage, resetEventLog } from './game.eventlog.functions';
import { addBackpackItem, addCoinsToBackpack, removeBackpackItemById,
  setBackpackItemLockById, updateBackpackItemById } from './game.backpack.functions';
import { changeAttack, changeHealth, setCharacterPrimaryInformation, setEquipmentItem, setHealth } from './game.character.functions';
import { addCardToLandmarkSlot, addCardToPlayerSlot, landmarkSlotTimerExpire, makeChoice,
  playerSlotTimerExpire, removeCardFromLandmarkSlot, removeCardFromPlayerSlot, setLandmarkSlotAttack,
  setLandmarkSlotData, setLandmarkSlotLock, setLandmarkSlotTimer, setPlayerSlotAttack,
  setPlayerSlotData, setPlayerSlotLock, setPlayerSlotTimer } from './game.landmark.functions';

export const attachments: IAttachment[] = [
  { action: StartGame, handler: startGame },

  { action: PageLoad, handler: pageLoad },
  { action: SetCurrentCardId, handler: setCurrentCardId },
  { action: AbandonGame, handler: abandonGame },
  { action: ReplaceNode, handler: replaceNode },

  { action: Move, handler: move },
  { action: EncounterCurrentTile, handler: move },
  { action: Warp, handler: warp },

  { action: AddEventLogMessage, handler: addEventLogMessage },
  { action: ResetEventLog, handler: resetEventLog },

  { action: AddBackpackItem, handler: addBackpackItem },
  { action: RemoveCharacterItemById, handler: removeBackpackItemById },
  { action: UpdateCharacterItemById, handler: updateBackpackItemById },
  { action: SetCharacterItemLockById, handler: setBackpackItemLockById },
  { action: RemoveCoinsFromBackpack, handler: addCoinsToBackpack },
  { action: AddCoinsToBackpack, handler: addCoinsToBackpack },

  { action: AddHealth, handler: changeHealth },
  { action: ReduceHealth, handler: changeHealth },
  { action: SetHealth, handler: setHealth },
  { action: ChangeAttack, handler: changeAttack },
  { action: UpdateCharacterPrimaryInformation, handler: setCharacterPrimaryInformation },
  { action: SetEquipmentItem, handler: setEquipmentItem },

  { action: MakeChoice, handler: makeChoice },

  { action: SetPlayerSlotLock, handler: setPlayerSlotLock },
  { action: SetPlayerSlotTimer, handler: setPlayerSlotTimer },
  { action: SetPlayerSlotData, handler: setPlayerSlotData },
  { action: SetPlayerSlotAttack, handler: setPlayerSlotAttack },
  { action: RemoveCardFromPlayerSlot, handler: removeCardFromPlayerSlot },
  { action: PlayerSlotTimerExpire, handler: playerSlotTimerExpire },
  { action: AddCardToPlayerSlot, handler: addCardToPlayerSlot },

  { action: SetLandmarkSlotLock, handler: setLandmarkSlotLock },
  { action: SetLandmarkSlotTimer, handler: setLandmarkSlotTimer },
  { action: SetLandmarkSlotData, handler: setLandmarkSlotData },
  { action: SetLandmarkSlotAttack, handler: setLandmarkSlotAttack },
  { action: RemoveCardFromLandmarkSlot, handler: removeCardFromLandmarkSlot },
  { action: LandmarkSlotTimerExpire, handler: landmarkSlotTimerExpire },
  { action: AddCardToLandmarkSlot, handler: addCardToLandmarkSlot }
];
