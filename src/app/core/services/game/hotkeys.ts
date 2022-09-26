
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable quote-props */
/* eslint-disable no-bitwise */

export type FilterFunction = (event: KeyboardEvent) => boolean;
export type HotkeyEvent = 'keydown' | 'keyup' | 'keypress';

export interface HotkeyOptions {
  filter?: FilterFunction;
  events?: HotkeyEvent[];
  delimiter?: string;
}

export interface HotkeyShortcut {
  shortcut: [string, string];
  handler: (event: KeyboardEvent) => boolean | void;
}

export interface InternalHotkeyShortcut extends HotkeyShortcut {
  code: [number, number];
}

export const HotkeyKeycodes = {

  /* Modifiers */
  alt: 0b1_00000000,
  option: 0b1_00000000,
  cmd: 0b10_00000000,
  command: 0b10_00000000,
  meta: 0b10_00000000,
  ctrl: 0b100_00000000,
  control: 0b100_00000000,
  shift: 0b1000_00000000,

  /* Special Characters */
  backspace: 1,
  capslock: 2,
  del: 3,
  delete: 3,
  down: 4,
  arrowdown: 4,
  end: 5,
  enter: 6,
  return: 6,
  esc: 7,
  escape: 7,
  home: 8,
  insert: 9,
  left: 10,
  arrowleft: 10,
  pagedown: 11,
  pageup: 12,
  right: 13,
  arrowright: 13,
  space: 14,
  spacebar: 14,
  tab: 15,
  up: 16,
  arrowup: 16,

  /* 0-9 */
  0: 17,
  1: 18,
  2: 19,
  3: 20,
  4: 21,
  5: 22,
  6: 23,
  7: 24,
  8: 25,
  9: 26,

  /* A-Z */
  a: 27,
  b: 28,
  c: 29,
  d: 30,
  e: 31,
  f: 32,
  g: 33,
  h: 34,
  i: 35,
  j: 36,
  k: 37,
  l: 38,
  m: 39,
  n: 40,
  o: 41,
  p: 42,
  q: 43,
  r: 44,
  s: 45,
  t: 46,
  u: 47,
  v: 48,
  w: 49,
  x: 50,
  y: 51,
  z: 52,

  /* Punctuation */
  '!': 53,
  '"': 54,
  '#': 55,
  '$': 56,
  '%': 57,
  '&': 58,
  '\'': 59,
  '(': 60,
  ')': 61,
  '*': 62,
  '+': 63,
  ',': 64,
  '-': 65,
  '.': 66,
  '/': 67,
  ':': 68,
  ';': 69,
  '<': 70,
  '=': 71,
  '>': 72,
  '?': 73,
  '@': 74,
  '[': 75,
  '\\': 76,
  ']': 77,
  '^': 78,
  '_': 79,
  '`': 80,
  '{': 81,
  '|': 82,
  '}': 83,
  '~': 84,

  /* Function Keys */
  f1: 85,
  f2: 86,
  f3: 87,
  f4: 88,
  f5: 89,
  f6: 90,
  f7: 91,
  f8: 92,
  f9: 93,
  f10: 94,
  f11: 95,
  f12: 96,
  f13: 97,
  f14: 98,
  f15: 99,
  f16: 100,
  f17: 101,
  f18: 102,
  f19: 103,
  f20: 104,
  f21: 105,
  f22: 106,
  f23: 107,
  f24: 108,

  /* Numpad */
  numpad0: 109,
  numpad1: 110,
  numpad2: 111,
  numpad3: 112,
  numpad4: 113,
  numpad5: 114,
  numpad6: 115,
  numpad7: 116,
  numpad8: 117,
  numpad9: 118
};

export class Hotkeys {

  private isRecording = false;
  private events = ['keydown'];
  private hotkeyMap: Record<number, InternalHotkeyShortcut> = {};
  private delimiter = '+';
  private recordCallback: (hotkey: string) => void;

  constructor(options: HotkeyOptions = {}) {
    const { filter, events, delimiter } = options;

    if(filter) this.filter = filter;
    if(events) this.events = events;
    if(delimiter) this.delimiter = delimiter;

    this.events.forEach(event => {
      document.addEventListener(event, this.listener);
    });
  }

  private filter: FilterFunction = (event: KeyboardEvent) => !event.defaultPrevented && !event.repeat;

  private listener = (event: KeyboardEvent) => {

    const keyCombo = this.parseKeycodeFromEvent(event);
    if(!keyCombo) return;

    const keyCode = this.getKeycodeNumberFromString(keyCombo);

    if(this.isRecording && this.recordCallback) {
      this.recordCallback(keyCombo);
      this.isRecording = false;
      return;
    }

    if(!this.filter(event)) return;

    if (this.hotkeyMap[keyCode])
      this.hotkeyMap[keyCode].handler(event);
  };

  getAllHotkeys(): HotkeyShortcut[] {
    return Object.values(this.hotkeyMap).flat();
  }

  addHotkey(hotkey: HotkeyShortcut): void {
    const primaryKeyCode = this.getKeycodeNumberFromString(hotkey.shortcut[0]);
    const secondaryKeyCode = this.getKeycodeNumberFromString(hotkey.shortcut[1]);

    const internalHotkey: InternalHotkeyShortcut = { ...hotkey, code: [primaryKeyCode, secondaryKeyCode] };

    this.hotkeyMap[primaryKeyCode] = internalHotkey;
    this.hotkeyMap[secondaryKeyCode] = internalHotkey;
  }

  removeHotkey(hotkey: [string, string]): void {
    const primaryKeyCode = this.getKeycodeNumberFromString(hotkey[0]);
    const secondaryKeyCode = this.getKeycodeNumberFromString(hotkey[1]);
    delete this.hotkeyMap[primaryKeyCode];
    delete this.hotkeyMap[secondaryKeyCode];
  }

  rebindHotkey(oldHotkey: [string, string], newHotkey: [string, string]) {
    const oldPrimaryKeyCode = this.getKeycodeNumberFromString(oldHotkey[0]);
    const newPrimaryKeyCode = this.getKeycodeNumberFromString(newHotkey[0]);
    const oldPrimaryHotkey = this.hotkeyMap[oldPrimaryKeyCode];

    const oldSecondaryKeyCode = this.getKeycodeNumberFromString(oldHotkey[1]);
    const newSecondaryKeyCode = this.getKeycodeNumberFromString(newHotkey[1]);
    const oldSecondaryHotkey = this.hotkeyMap[oldSecondaryKeyCode];

    delete this.hotkeyMap[oldPrimaryKeyCode];
    delete this.hotkeyMap[oldSecondaryKeyCode];

    this.hotkeyMap[newPrimaryKeyCode] = oldPrimaryHotkey;
    this.hotkeyMap[newPrimaryKeyCode].shortcut = newHotkey;

    this.hotkeyMap[newSecondaryKeyCode] = oldSecondaryHotkey;
    this.hotkeyMap[newSecondaryKeyCode].shortcut = newHotkey;
  }

  removeAllHotkeys() {
    this.hotkeyMap = {};
  }

  async recordHotkey(): Promise<string> {
    return new Promise(resolve => {
      this.isRecording = true;
      this.recordCallback = (hotkey: string) => {
        resolve(hotkey);
        delete this.recordCallback;
      };
    });
  }

  private getKeycodeNumberFromString(keyString: string): number {
    return keyString.split(this.delimiter).reduce((prev, cur) => prev | HotkeyKeycodes[cur.toLowerCase()], 0);
  }

  private parseKeycodeFromEvent(event: KeyboardEvent): string {
    if(['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return '';

    let metaString = '';
    if (event.metaKey) metaString = `${metaString}Meta${this.delimiter}`;

    if (event.altKey) metaString = `Alt${this.delimiter}`;
    if (event.ctrlKey) metaString = `${metaString}Control${this.delimiter}`;
    if (event.shiftKey) metaString = `${metaString}Shift${this.delimiter}`;

    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;

    return `${metaString}${key}`;
  }

}
