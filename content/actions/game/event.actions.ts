import { ICard, IScenario } from '../../interfaces';


export class MakeChoice {
  static type = '[Game] Make Choice';
  constructor(public choice: number) {}
}

export class Move {
  static type = '[Game] Move';
  constructor(public xDelta: number, public yDelta: number) {}
}

export class EncounterCurrentTile extends Move {
  static type = '[Game] Encounter Current Tile';
  constructor() {
    super(0, 0);
  }
}

export class Warp {
  static type = '[Game] Warp';
  constructor(public scenario: IScenario, public warpToWorld: number, public warpToLandmark: number) {}
}

export class AddEventLogMessage {
  static type = '[Game] Add Event Log Message';
  constructor(public message: string, public truncateAfter: number) {}
}

export class ResetEventLog {
  static type = '[Game] Reset Event Log';
  constructor() {}
}

// landmark updates
export class AddCardToLandmarkSlot {
  static type = '[Game] Add Card To Landmark Slot';
  constructor(public slot: number, public card: ICard) {}
}

export class AddCardToPlayerSlot {
  static type = '[Game] Add Card To Player Slot';
  constructor(public slot: number, public card: ICard) {}
}

export class LandmarkSlotTimerExpire {
  static type = '[Game] Landmark Slot Timer Expire';
  constructor(public slot: number) {}
}

export class SetLandmarkSlotLock {
  static type = '[Game] Set Landmark Slot Lock';
  constructor(public slot: number, public isLocked: boolean) {}
}

export class SetLandmarkSlotTimer {
  static type = '[Game] Set Landmark Slot Timer';
  constructor(public slot: number, public timer: number, public resetMaxTimer = false) {}
}

export class SetLandmarkSlotAttack {
  static type = '[Game] Set Landmark Slot Lock';
  constructor(public slot: number, public attack: string) {}
}

export class SetLandmarkSlotData {
  static type = '[Game] Set Landmark Slot Data';
  constructor(public slot: number, public data: Record<string, any>) {}
}

// player updates
export class PlayerSlotTimerExpire {
  static type = '[Game] Player Slot Timer Expire';
  constructor(public slot: number) {}
}

export class SetPlayerSlotLock {
  static type = '[Game] Set Player Slot Lock';
  constructor(public slot: number, public isLocked: boolean) {}
}

export class SetPlayerSlotTimer {
  static type = '[Game] Set Player Slot Timer';
  constructor(public slot: number, public timer: number, public resetMaxTimer = false) {}
}

export class SetPlayerSlotAttack {
  static type = '[Game] Set Player Slot Attack';
  constructor(public slot: number, public attack: string) {}
}

export class RemoveCardFromLandmarkSlot {
  static type = '[Game] Remove Card From Landmark Slot';
  constructor(public slot: number) {}
}

export class SetPlayerSlotData {
  static type = '[Game] Set Player Slot Data';
  constructor(public slot: number, public data: Record<string, any>) {}
}

export class RemoveCardFromPlayerSlot {
  static type = '[Game] Remove Card From Player Slot';
  constructor(public slot: number) {}
}
