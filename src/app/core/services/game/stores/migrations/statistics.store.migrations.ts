
export const statisticsStoreMigrations = [
  {
    version: undefined,
    migrate: (state) => ({
      version: 1,
      ...state
    })
  }
].map(x => ({ ...x, key: 'statistics' }));
