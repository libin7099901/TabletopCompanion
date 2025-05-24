// 🎮 游戏引擎核心系统

import { 
  GameState, 
  GameAction, 
  GameRules, 
  GamePlayer, 
  GameSettings,
  ActionType
} from '../types/game';
import { Player } from '../types/common';

export class GameEngine {
  private state: GameState;
  private rules: GameRules;
  private listeners: GameEventListener[] = [];

  constructor(templateId: string, players: Player[], rules: GameRules, settings?: Partial<GameSettings>) {
    this.rules = rules;
    this.state = this.initializeGame(templateId, players, settings);
  }

  // === 游戏状态管理 ===
  
  private initializeGame(templateId: string, players: Player[], settings?: Partial<GameSettings>): GameState {
    const gamePlayers: GamePlayer[] = players.map((player, index) => ({
      ...player,
      isAI: player.id.startsWith('ai_'),
      score: 0,
      isActive: index === 0,
      isReady: true
    }));

    return {
      id: `game_${Date.now()}`,
      templateId,
      players: gamePlayers,
      currentPlayerIndex: 0,
      round: 1,
      phase: 'setup',
      status: 'preparing',
      score: Object.fromEntries(players.map(p => [p.id, 0])),
      history: [],
      settings: {
        timeLimit: 30,
        autoSkip: false,
        allowUndo: true,
        showHints: true,
        difficulty: 'medium',
        ...settings
      },
      startTime: new Date().toISOString()
    };
  }

  // === 游戏控制 ===

  public startGame(): boolean {
    if (this.state.status !== 'preparing') {
      return false;
    }

    this.state.status = 'active';
    this.state.phase = 'playing';
    this.state.startTime = new Date().toISOString();
    
    this.notifyListeners('gameStarted', this.state);
    return true;
  }

  public pauseGame(): boolean {
    if (this.state.status !== 'active') {
      return false;
    }

    this.state.status = 'paused';
    this.notifyListeners('gamePaused', this.state);
    return true;
  }

  public resumeGame(): boolean {
    if (this.state.status !== 'paused') {
      return false;
    }

    this.state.status = 'active';
    this.notifyListeners('gameResumed', this.state);
    return true;
  }

  public endGame(_reason: string = 'Game completed'): void {
    this.state.status = 'finished';
    this.state.endTime = new Date().toISOString();
    
    const winResult = this.rules.checkWinCondition(this.state);
    this.notifyListeners('gameEnded', { state: this.state, winResult });
  }

  // === 动作执行 ===

  public executeAction(action: GameAction): boolean {
    // 验证动作
    if (!this.rules.validateAction(this.state, action)) {
      this.notifyListeners('actionRejected', { action, reason: 'Invalid action' });
      return false;
    }

    // 验证回合
    if (!this.isPlayerTurn(action.playerId)) {
      this.notifyListeners('actionRejected', { action, reason: 'Not player turn' });
      return false;
    }

    // 执行动作
    try {
      const newState = this.rules.executeAction(this.state, action);
      
      // 添加到历史记录
      action.timestamp = new Date().toISOString();
      action.isValid = true;
      newState.history.push(action);

      this.state = newState;
      this.notifyListeners('actionExecuted', { action, state: this.state });

      // 检查游戏结束条件
      const winResult = this.rules.checkWinCondition(this.state);
      if (winResult) {
        this.endGame('Win condition met');
        return true;
      }

      // 切换到下一个玩家
      this.nextTurn();
      
      return true;
    } catch (error) {
      this.notifyListeners('actionRejected', { 
        action, 
        reason: error instanceof Error ? error.message : 'Execution failed' 
      });
      return false;
    }
  }

  private nextTurn(): void {
    const nextIndex = this.rules.getNextPlayer(this.state);
    
    // 更新当前玩家
    this.state.players.forEach((player, index) => {
      player.isActive = index === nextIndex;
    });
    
    this.state.currentPlayerIndex = nextIndex;
    
    // 检查是否需要开始新回合
    if (nextIndex === 0) {
      this.state.round++;
    }

    this.notifyListeners('turnChanged', {
      currentPlayer: this.state.players[nextIndex],
      round: this.state.round
    });
  }

  // === 辅助方法 ===

  private isPlayerTurn(playerId: string): boolean {
    const currentPlayer = this.state.players[this.state.currentPlayerIndex];
    return currentPlayer.id === playerId;
  }

  public getValidActions(playerId: string): ActionType[] {
    if (!this.isPlayerTurn(playerId)) {
      return [];
    }
    return this.rules.getValidActions(this.state, playerId);
  }

  public getCurrentPlayer(): GamePlayer {
    return this.state.players[this.state.currentPlayerIndex];
  }

  public getGameState(): GameState {
    return { ...this.state };
  }

  public getScore(playerId: string): number {
    return this.rules.calculateScore(this.state, playerId);
  }

  // === 撤销功能 ===

  public undoLastAction(): boolean {
    if (!this.state.settings.allowUndo || this.state.history.length === 0) {
      return false;
    }

    const lastAction = this.state.history.pop();
    if (!lastAction) return false;

    // 重新计算状态（简化实现）
    this.notifyListeners('actionUndone', { action: lastAction });
    return true;
  }

  // === 事件系统 ===

  public addEventListener(listener: GameEventListener): void {
    this.listeners.push(listener);
  }

  public removeEventListener(listener: GameEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in game event listener:', error);
      }
    });
  }

  // === 序列化 ===

  public serialize(): string {
    return JSON.stringify({
      state: this.state,
      timestamp: new Date().toISOString()
    });
  }

  public static deserialize(data: string, rules: GameRules): GameEngine {
    const { state } = JSON.parse(data);
    const engine = Object.create(GameEngine.prototype);
    engine.state = state;
    engine.rules = rules;
    engine.listeners = [];
    return engine;
  }
}

// === 工具类 ===

export class ActionBuilder {
  private action: Partial<GameAction>;

  constructor(playerId: string, type: ActionType) {
    this.action = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      type,
      timestamp: new Date().toISOString(),
      isValid: false
    };
  }

  public withData(data: any): ActionBuilder {
    this.action.data = data;
    return this;
  }

  public build(): GameAction {
    return this.action as GameAction;
  }
}

// === 事件类型 ===

export type GameEventListener = (event: string, data: any) => void;

// === 工厂函数 ===

export function createAction(playerId: string, type: ActionType, data?: any): GameAction {
  return new ActionBuilder(playerId, type).withData(data).build();
} 