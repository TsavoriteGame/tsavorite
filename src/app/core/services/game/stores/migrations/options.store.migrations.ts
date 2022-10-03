
export const optionsStoreMigrations = [
  {
    version: undefined,
    migrate: (state) => ({
      version: 1,
      ...state
    })
  }
].map(x => ({ ...x, key: 'options' }));
