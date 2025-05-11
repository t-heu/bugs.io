export interface Player {
  name: string;
  uid: string;
  killer: string
  size: number
  score: number
  stats: {
    speed: number
    attack: number
    health: number
    maxHealth: number
  },
  position: { x: number; y: number }
  effects: {
    shieldExpiresAt: number
    speedExpiresAt: number
    specialAttackExpiresAt: number
    slowExpiresAt: number
    poisonedExpiresAt: number
  },
  type: string
  ability: any | null
  lastUpdate: number
};

export interface GameRoom {
  gameInProgress: boolean,
  createdAt: number,
  food: any[],
  cactus: any[],
  players: Player[],
  roomId: string,
  host: string,
}
