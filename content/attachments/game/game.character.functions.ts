import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { AddHealth, ChangeAttack, SetEquipmentItem, SetHealth, UpdateCharacterPrimaryInformation } from '../../actions';
import { EquipmentSlot, IGame, IGameCharacter, IItemConfig } from '../../interfaces';
import { isInGame } from './game.anonymous.functions';
import { setPlayerSlotAttack } from './game.landmark.functions';


export function setHealth(ctx: StateContext<IGame>, { amount }: SetHealth) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      hp: amount
    })
  }));
}

export function changeHealth(ctx: StateContext<IGame>, { amount }: AddHealth) {
  if(!isInGame(ctx)) {
    return;
  }

  const currentHP = ctx.getState().character.hp;

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      hp: currentHP + amount
    })
  }));
}

export function changeAttack(ctx: StateContext<IGame>, { attack }: ChangeAttack) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      chosenAttack: attack
    })
  }));
}

export function setCharacterPrimaryInformation(ctx: StateContext<IGame>, { hp, equipment, body }: UpdateCharacterPrimaryInformation) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      equipment,
      body,
      hp
    })
  }));
}

export function setEquipmentItem(ctx: StateContext<IGame>, { item, slot }: SetEquipmentItem) {
  if(!isInGame(ctx)) {
    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      equipment: patch<Record<EquipmentSlot, IItemConfig>>({
        [slot]: item
      })
    })
  }));

  if(slot === EquipmentSlot.Hands) {
    changeAttack(ctx, { attack: 'Attack' });
    setPlayerSlotAttack(ctx, { slot: 0, attack: 'Attack' });
  }
}
