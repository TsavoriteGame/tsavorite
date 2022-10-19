import { StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { isUndefined } from 'lodash';
import { AddBackpackItem, AddCoinsToBackpack, RemoveCharacterItemById,
  SetCharacterItemLockById, UpdateCharacterItemById } from '../../actions';
import { isFunctional } from '../../helpers';
import { EquipmentSlot, GameConstant, IGame, IGameCharacter, IItemConfig, IItemInteraction, Interaction } from '../../interfaces';
import { findCharacterEquipmentSlotWithCardId, getConstant, isInGame } from './game.anonymous.functions';
import { getServices } from './game.services.functions';

export function addBackpackItem(ctx: StateContext<IGame>, { item }: AddBackpackItem) {
  if(!isInGame(ctx)) {
    return;
  }

  if(ctx.getState().character.items.length >= getConstant(GameConstant.BackpackSize)) {
    return;
  }

  if(isUndefined(item.cardId)) {
    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      items: append<IItemConfig>([item])
    })
  }));
}

export function removeBackpackItemById(ctx: StateContext<IGame>, { cardId }: RemoveCharacterItemById) {
  if(!isInGame(ctx)) {
    return;
  }

  const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

  // if we can't find it in the backpack, check the hands
  if(index === -1) {

    // check all equipment slots for the item
    const equipmentSlot = findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
    if(equipmentSlot) {
      ctx.setState(patch<IGame>({
        character: patch<IGameCharacter>({
          equipment: patch<Record<EquipmentSlot, IItemConfig>>({
            [equipmentSlot]: undefined
          })
        })
      }));
    }

    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      items: removeItem<IItemConfig>(index)
    })
  }));
}

export function updateBackpackItemById(ctx: StateContext<IGame>, { item, cardId }: UpdateCharacterItemById) {
  if(!isInGame(ctx)) {
    return;
  }

  if(!isFunctional(item)) {
    removeBackpackItemById(ctx, { cardId });
    return;
  }

  const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

  if(index === -1) {

    // check all equipment slots for the item
    const equipmentSlot = findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
    if(equipmentSlot) {
      ctx.setState(patch<IGame>({
        character: patch<IGameCharacter>({
          equipment: patch<Record<EquipmentSlot, IItemConfig>>({
            [equipmentSlot]: item
          })
        })
      }));
    }

    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      items: updateItem<IItemConfig>(index, item)
    })
  }));
}

export function setBackpackItemLockById(ctx: StateContext<IGame>, { cardId, locked }: SetCharacterItemLockById) {
  if(!isInGame(ctx)) {
    return;
  }

  const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

  // if we can't find it in the backpack, check the hands
  if(index === -1) {

    // check all equipment slots for the item
    const equipmentSlot = findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
    if(equipmentSlot) {
      ctx.setState(patch<IGame>({
        character: patch<IGameCharacter>({
          equipment: patch<Record<EquipmentSlot, IItemConfig>>({
            [equipmentSlot]: patch<IItemConfig>({
              locked
            })
          })
        })
      }));
    }

    return;
  }

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      items: updateItem<IItemConfig>(index, patch<IItemConfig>({
        locked
      }))
    })
  }));
}

export function addCoinsToBackpack(ctx: StateContext<IGame>, { amount }: AddCoinsToBackpack) {
  if(!isInGame(ctx)) {
    return;
  }

  const { contentService } = getServices();

  const index = ctx.getState().character.items.findIndex(checkItem => checkItem.interaction?.name === Interaction.Buys);

  // if we cant find coins, we check hands
  if(index === -1) {

    // check the hands, and modify that value
    const handItem = ctx.getState().character.equipment[EquipmentSlot.Hands];
    if(handItem?.interaction.name === Interaction.Buys) {
      const newHandsValue = Math.max(1, handItem.interaction.level + amount);

      ctx.setState(patch<IGame>({
        character: patch<IGameCharacter>({
          equipment: patch<Record<EquipmentSlot, IItemConfig>>({
            [EquipmentSlot.Hands]: patch<IItemConfig>({
              interaction: patch<IItemInteraction>({
                level: newHandsValue
              })
            })
          })
        })
      }));

      return;
    }

    // if it isn't in hands, we add a new one if the value is positive
    if(amount > 0) {
      const coins = contentService.getItemById('GoldCoins-1');
      coins.interaction.level = amount;

      addBackpackItem(ctx, { item: coins });
    }

    return;
  }

  // find out how many coins we have, and add some more
  const item = ctx.getState().character.items[index];
  const newValue = Math.max(1, item.interaction.level + amount);

  ctx.setState(patch<IGame>({
    character: patch<IGameCharacter>({
      items: updateItem<IItemConfig>(index, patch<IItemConfig>({
        interaction: patch<IItemInteraction>({
          level: newValue
        })
      }))
    })
  }));
};
