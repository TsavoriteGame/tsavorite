

export class ChangeAttack {
  static type = '[Game] Change Attack';
  constructor(public attack: string) {}
}

export class AddHealth {
  static type = '[Game] Add Health';
  constructor(public amount: number) {}
}

export class ReduceHealth {
  static type = '[Game] Reduce Health';
  constructor(public amount: number) {
    this.amount = -amount;
  }
}

export class SetHealth {
  static type = '[Game] Set Health';
  constructor(public amount: number) {}
}
