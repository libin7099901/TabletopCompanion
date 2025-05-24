// 🎮 游戏核心类型定义

import { Player } from './common';

// === 游戏状态管理 ===
export interface GameState {
  id: string;
  templateId: string;
  players: GamePlayer[];
  currentPlayerIndex: number;
  round: number;
  phase: GamePhase;
  status: GameStatus;
  board?: BoardState;
  deck?: CardDeck;
  dice?: DiceState;
  score: Record<string, number>;
  history: GameAction[];
  settings: GameSettings;
  startTime: string;
  lastActivity?: string;
  endTime?: string;
}

export interface GamePlayer extends Player {
  isAI: boolean;
  hand?: Card[];
  position?: Position;
  score: number;
  isActive: boolean;
  isReady: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export type GamePhase = 
  | 'setup'        // 游戏设置
  | 'dealing'      // 发牌阶段
  | 'playing'      // 游戏进行
  | 'betting'      // 下注阶段
  | 'rolling'      // 掷骰子阶段
  | 'revealing'    // 翻牌阶段
  | 'scoring'      // 计分阶段
  | 'finished';    // 游戏结束

export type GameStatus = 
  | 'preparing'    // 准备中
  | 'active'       // 进行中
  | 'paused'       // 暂停
  | 'finished'     // 已结束
  | 'aborted';     // 中止

export interface GameSettings {
  timeLimit?: number;        // 每回合时间限制（秒）
  autoSkip: boolean;         // 自动跳过
  allowUndo: boolean;        // 允许撤销
  showHints: boolean;        // 显示提示
  difficulty: 'easy' | 'medium' | 'hard';
}

// === 游戏动作 ===
export interface GameAction {
  id: string;
  playerId: string;
  type: ActionType;
  data: any;
  timestamp: string;
  isValid: boolean;
}

export type ActionType = 
  | 'move'         // 移动
  | 'place'        // 放置
  | 'draw'         // 抽牌
  | 'play'         // 出牌
  | 'bet'          // 下注
  | 'fold'         // 弃牌
  | 'call'         // 跟注
  | 'raise'        // 加注
  | 'roll'         // 掷骰子
  | 'pass'         // 跳过
  | 'undo'         // 撤销
  | 'surrender';   // 投降

// === 卡牌系统 ===
export interface Card {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  isVisible: boolean;
  isPlayable: boolean;
}

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardDeck {
  cards: Card[];
  discardPile: Card[];
  shuffled: boolean;
}

// === 棋盘系统 ===
export interface BoardState {
  width: number;
  height: number;
  cells: BoardCell[][];
  pieces: GamePiece[];
}

export interface BoardCell {
  x: number;
  y: number;
  type: CellType;
  piece?: GamePiece;
  isHighlighted: boolean;
  isSelectable: boolean;
}

export type CellType = 'normal' | 'special' | 'blocked' | 'start' | 'end';

export interface GamePiece {
  id: string;
  playerId: string;
  type: PieceType;
  position: Position;
  isSelected: boolean;
  canMove: boolean;
}

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'checker' | 'token';

// === 骰子系统 ===
export interface DiceState {
  dice: Die[];
  rollCount: number;
  maxRolls: number;
  isRolling: boolean;
}

export interface Die {
  id: string;
  sides: number;
  value?: number;
  isSelected: boolean;
  isLocked: boolean;
}

// === 游戏规则引擎 ===
export interface GameRules {
  validateAction(state: GameState, action: GameAction): boolean;
  executeAction(state: GameState, action: GameAction): GameState;
  checkWinCondition(state: GameState): WinResult | null;
  getValidActions(state: GameState, playerId: string): ActionType[];
  getNextPlayer(state: GameState): number;
  calculateScore(state: GameState, playerId: string): number;
}

export interface WinResult {
  winnerId?: string;
  isDraw: boolean;
  reason: string;
  finalScores: Record<string, number>;
}

// === AI系统 ===
export interface AIPlayer {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  strategy: AIStrategy;
  thinkingTime: number; // 毫秒
}

export interface AIStrategy {
  evaluateState(state: GameState): number;
  selectAction(state: GameState, validActions: ActionType[]): GameAction;
  shouldBluff(): boolean;
  riskTolerance: number; // 0-1
}

// === 游戏模板系统 ===
export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: 'card' | 'board' | 'dice' | 'hybrid';
  rules: GameRules;
  initialState: Partial<GameState>;
  components: GameComponent[];
  assets: GameAssets;
}

export interface GameComponent {
  id: string;
  type: ComponentType;
  name: string;
  properties: Record<string, any>;
}

export type ComponentType = 
  | 'deck'         // 卡牌组
  | 'board'        // 棋盘
  | 'pieces'       // 棋子
  | 'dice'         // 骰子
  | 'tokens'       // 代币
  | 'timer'        // 计时器
  | 'scoreboard';  // 计分板

export interface GameAssets {
  images: Record<string, string>;
  sounds: Record<string, string>;
  animations: Record<string, AnimationConfig>;
}

export interface AnimationConfig {
  type: 'move' | 'fade' | 'scale' | 'rotate';
  duration: number;
  easing: string;
} 