import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { RebindKey, SetOption, SetPaused, ToggleOption } from '../../actions';
import { GameOption, IOptions, Keybind } from '../../interfaces';
import { pauseGame } from '../../rxjs.helpers';

export const defaultKeymap: () => Record<Keybind, [string, string]> = () => ({
  [Keybind.Pause]: ['Escape', ''],
  [Keybind.MoveUp]: ['ArrowUp', 'W'],
  [Keybind.MoveDown]: ['ArrowDown', 'S'],
  [Keybind.MoveLeft]: ['ArrowLeft', 'A'],
  [Keybind.MoveRight]: ['ArrowRight', 'D'],
  [Keybind.Choice1]: ['1', ''],
  [Keybind.Choice2]: ['2', ''],
  [Keybind.Choice3]: ['3', ''],
  [Keybind.Choice4]: ['4', '']
});

export const defaultOptions: () => IOptions = () => ({
  version: 1,
  [GameOption.IsPaused]: false,
  [GameOption.MasterVolume]: 0.5,
  [GameOption.IsFantasyFont]: true,
  [GameOption.IsDebugMode]: false,
  [GameOption.Keymap]: defaultKeymap(),
  [GameOption.GameSpeed]: 1,
});

export function resetOptions(ctx: StateContext<IOptions>) {
  ctx.setState(defaultOptions());
}

export function setOption(ctx: StateContext<IOptions>, { option, value }: SetOption) {
  ctx.patchState({ [option]: value });
}

export function setPaused(ctx: StateContext<IOptions>, { isPaused }: SetPaused) {
  setOption(ctx, { option: GameOption.IsPaused, value: isPaused });
  pauseGame.next(isPaused);
}

export function toggleOption(ctx: StateContext<IOptions>, { option }: ToggleOption) {
  const state = ctx.getState();
  ctx.patchState({ [option]: !state[option] });
}

export function rebindKey(ctx: StateContext<IOptions>, { keybind, newKey, isPrimaryKey }: RebindKey) {
  const currentBinding = ctx.getState().keymap[keybind];
  ctx.setState(patch<IOptions>({
    [GameOption.Keymap]: patch<Record<Keybind, [string, string]>>({
      [keybind]: (isPrimaryKey ? [newKey, currentBinding[1]] : [currentBinding[0], newKey])
    })
  }));
}
