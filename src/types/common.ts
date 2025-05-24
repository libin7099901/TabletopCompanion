// 通用类型定义
export interface PlayerPreferences {
  favoriteGameType?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  playStyle?: 'casual' | 'competitive' | 'strategic' | 'social';
  aiAssistance?: boolean;
  soundEffects?: boolean;
  animations?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  isConnected: boolean;
  preferences?: PlayerPreferences;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  gameTemplate?: GameTemplate;
  maxPlayers: number;
  isPrivate: boolean;
  createdAt: Date;
}

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // 分钟
  components: GameComponent[];
  rules: GameRule[];
  metadata: TemplateMetadata;
}

export interface GameComponent {
  id: string;
  type: 'board' | 'card' | 'token' | 'dice' | 'timer' | 'score_tracker' | 'custom';
  name: string;
  properties: Record<string, any>;
  position?: Position;
  size?: Size;
}

export interface GameRule {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  conditions?: string[];
  actions?: string[];
}

export interface TemplateMetadata {
  author: string;
  tags: string[];
  language: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail?: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameState {
  currentPhase: string;
  activePlayer?: string;
  turnCount: number;
  gameData: Record<string, any>;
  startedAt?: Date;
  pausedAt?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'chat' | 'system' | 'game_action';
  timestamp: Date;
} 