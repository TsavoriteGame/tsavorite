import { type Store } from '@ngxs/store';

let store: Store;

export function setStore(newStore: Store) {
  store = newStore;
}

export function getStore() {
  return store;
}
