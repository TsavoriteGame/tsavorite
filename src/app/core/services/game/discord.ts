export interface DiscordRPCStatus {
  isInGame: boolean;
  isMakingCharacter: boolean;
  background: string;
  playerName: string;

  state?: string;
  details?: string;
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

  status.state = 'In a menu';
  if(status.isInGame) {
    status.state = 'Wandering the world';
  } else if (status.isMakingCharacter) {
    status.state = 'Planning their next move';
  }

  status.details = status.isInGame ? `Playing as ${status.playerName}, ${status.background}` : '';

  (window as any).discordRPCStatus = status;
};

export const setDiscordRPCStatus = (newStatus: DiscordRPCStatus) => {
  status.isInGame = newStatus.isInGame;
  status.isMakingCharacter = newStatus.isMakingCharacter;
  status.background = newStatus.background;
  status.playerName = newStatus.playerName;

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
