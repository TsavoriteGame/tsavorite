export interface DiscordRPCStatus {
  isInGame: boolean;
  isMakingCharacter: boolean;
  background: string;
  playerName: string;

  state: string;
  details: string;
}

const status: DiscordRPCStatus = {
  isInGame: false,
  isMakingCharacter: false,
  background: '',
  playerName: '',

  state: 'In a menu',
  details: ''
};

export const getDiscordRPCStatus = (): DiscordRPCStatus => status;

export const updateDiscordRPCStatus = (): void => {
  status.state = status.isInGame ? 'Wandering the world' :
    status.isMakingCharacter ? 'Planning their next move' : 'In a menu';
  status.details = status.isInGame ? `Playing as ${status.playerName}, ${status.background}` : '';

  (window as any).discordRPCStatus = status;
};

export const setDiscordRPCStatus =
  (isInGame: boolean, isMakingCharacter: boolean,
   background: string, name: string) => {
    status.isInGame = isInGame;
    status.isMakingCharacter = isMakingCharacter;
    status.background = background;
    status.playerName = name;

    updateDiscordRPCStatus();
  };

export const setIsInGame = (isInGame: boolean): void => {
  status.isInGame = isInGame;
};

export const setIsMakingCharacter = (isMakingCharacter: boolean): void => {
  status.isMakingCharacter = isMakingCharacter;
};

export const setPlayerBackground = (background: string): void => {
  status.background = background;
};

export const setPlayerName = (name: string): void => {
  status.playerName = name;
};
