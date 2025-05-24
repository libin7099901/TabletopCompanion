// 🎲 猜大小骰子游戏

import {
  GameState,
  GameAction,
  GameRules,
  WinResult,
  ActionType,
  DiceState,
  Die
} from '../types/game';

// === 规则验证 ===

export class DiceGuessRules implements GameRules {
  private readonly DICE_COUNT = 3;
  private readonly ROUNDS_TO_WIN = 5;
  private readonly INITIAL_CHIPS = 100;

  validateAction(state: GameState, action: GameAction): boolean {
    switch (action.type) {
      case 'bet':
        return this.canBet(state, action.playerId, action.data);
      case 'roll':
        return this.canRoll(state, action.playerId);
      default:
        return false;
    }
  }

  private canBet(state: GameState, playerId: string, betData: any): boolean {
    if (state.phase !== 'betting') return false;
    
    const player = state.players.find(p => p.id === playerId);
    if (!player) return false;
    
    const { guess, amount } = betData;
    
    // 检查下注类型
    if (guess !== 'big' && guess !== 'small') return false;
    
    // 检查下注金额
    if (amount <= 0 || amount > player.score) return false;
    
    return true;
  }

  private canRoll(state: GameState, playerId: string): boolean {
    return state.phase === 'rolling' && 
           state.players[state.currentPlayerIndex].id === playerId;
  }

  // === 动作执行 ===

  executeAction(state: GameState, action: GameAction): GameState {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    
    switch (action.type) {
      case 'bet':
        return this.executeBetAction(newState, action);
      case 'roll':
        return this.executeRollAction(newState, action);
      default:
        return newState;
    }
  }

  private executeBetAction(state: GameState, action: GameAction): GameState {
    const { guess, amount } = action.data;
    const player = state.players.find(p => p.id === action.playerId)!;
    
    // 扣除筹码
    player.score -= amount;
    
    // 记录下注
    if (!state.history.find(h => h.playerId === action.playerId && h.type === 'bet')) {
      // 存储下注信息到历史记录
      state.history.push({
        ...action,
        data: { guess, amount, playerId: action.playerId }
      });
    }
    
    // 检查是否所有玩家都下注完毕
    const allPlayersBet = state.players.every(p => 
      state.history.some(h => h.playerId === p.id && h.type === 'bet')
    );
    
    if (allPlayersBet) {
      state.phase = 'rolling';
      state.currentPlayerIndex = 0; // 庄家掷骰子
    }
    
    return state;
  }

  private executeRollAction(state: GameState, _action: GameAction): GameState {
    if (!state.dice) {
      state.dice = this.createDiceState();
    }
    
    // 掷骰子
    state.dice.dice.forEach(die => {
      die.value = Math.floor(Math.random() * die.sides) + 1;
    });
    
    state.dice.rollCount++;
    state.dice.isRolling = false;
    
    // 计算结果并结算
    this.settleBets(state);
    
    // 检查游戏是否结束
    if (this.checkGameEnd(state)) {
      state.status = 'finished';
      state.phase = 'finished';
    } else {
      // 开始新回合
      this.startNewRound(state);
    }
    
    return state;
  }

  private createDiceState(): DiceState {
    const dice: Die[] = [];
    
    for (let i = 0; i < this.DICE_COUNT; i++) {
      dice.push({
        id: `dice_${i}`,
        sides: 6,
        value: undefined,
        isSelected: false,
        isLocked: false
      });
    }
    
    return {
      dice,
      rollCount: 0,
      maxRolls: 1,
      isRolling: false
    };
  }

  private settleBets(state: GameState): void {
    if (!state.dice) return;
    
    // 计算骰子总点数
    const totalPoints = state.dice.dice.reduce((sum, die) => sum + (die.value || 0), 0);
    const result = totalPoints >= 11 ? 'big' : 'small';
    
    // 结算所有下注
    const betActions = state.history.filter(h => h.type === 'bet');
    
    for (const betAction of betActions) {
      const { guess, amount, playerId } = betAction.data;
      const player = state.players.find(p => p.id === playerId)!;
      
      if (guess === result) {
        // 猜对了，返还本金并获得奖金
        player.score += amount * 2;
      }
      // 猜错了，筹码已经扣除，不用做额外处理
    }
    
    // 更新分数记录
    state.players.forEach(player => {
      state.score[player.id] = player.score;
    });
  }

  private checkGameEnd(state: GameState): boolean {
    // 检查是否有玩家破产
    const bankruptPlayers = state.players.filter(p => p.score <= 0);
    if (bankruptPlayers.length > 0) {
      return true;
    }
    
    // 检查是否达到回合限制
    return state.round >= this.ROUNDS_TO_WIN;
  }

  private startNewRound(state: GameState): void {
    state.round++;
    state.phase = 'betting';
    state.currentPlayerIndex = 0;
    
    // 清空历史记录中的下注信息
    state.history = state.history.filter(h => h.type !== 'bet');
    
    // 重置骰子状态
    if (state.dice) {
      state.dice.rollCount = 0;
      state.dice.dice.forEach(die => {
        die.value = undefined;
      });
    }
  }

  // === 胜利条件检查 ===

  checkWinCondition(state: GameState): WinResult | null {
    if (state.status !== 'finished') return null;
    
    // 找到筹码最多的玩家
    let maxScore = -1;
    let winners: string[] = [];
    
    for (const player of state.players) {
      if (player.score > maxScore) {
        maxScore = player.score;
        winners = [player.id];
      } else if (player.score === maxScore) {
        winners.push(player.id);
      }
    }
    
    if (winners.length === 1) {
      const winner = state.players.find(p => p.id === winners[0])!;
      return {
        winnerId: winners[0],
        isDraw: false,
        reason: `${winner.name} 以 ${maxScore} 筹码获胜！`,
        finalScores: state.score
      };
    } else {
      return {
        isDraw: true,
        reason: `多名玩家并列第一，各有 ${maxScore} 筹码！`,
        finalScores: state.score
      };
    }
  }

  // === 游戏逻辑 ===

  getValidActions(state: GameState, playerId: string): ActionType[] {
    if (state.status !== 'active') return [];
    
    switch (state.phase) {
      case 'betting':
        // 检查该玩家是否已经下注
        const hasBet = state.history.some(h => h.playerId === playerId && h.type === 'bet');
        return hasBet ? [] : ['bet'];
      
      case 'rolling':
        const currentPlayer = state.players[state.currentPlayerIndex];
        return currentPlayer.id === playerId ? ['roll'] : [];
      
      default:
        return [];
    }
  }

  getNextPlayer(state: GameState): number {
    return (state.currentPlayerIndex + 1) % state.players.length;
  }

  calculateScore(state: GameState, playerId: string): number {
    return state.score[playerId] || this.INITIAL_CHIPS;
  }
}

// === 工厂函数 ===

export function createDiceGuessGame(): {
  rules: GameRules;
  initialState: Partial<GameState>;
} {
  const rules = new DiceGuessRules();
  
  const initialState: Partial<GameState> = {
    phase: 'betting',
    dice: {
      dice: [
        { id: 'dice_0', sides: 6, isSelected: false, isLocked: false },
        { id: 'dice_1', sides: 6, isSelected: false, isLocked: false },
        { id: 'dice_2', sides: 6, isSelected: false, isLocked: false }
      ],
      rollCount: 0,
      maxRolls: 1,
      isRolling: false
    }
  };

  return { rules, initialState };
}

// === AI策略 ===

export class DiceGuessAI {
  // 简单AI策略
  public getBestBet(state: GameState, playerId: string): { guess: 'big' | 'small'; amount: number } | null {
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.score <= 0) return null;
    
    // 简单策略：随机选择大小，下注当前筹码的10%
    const guess = Math.random() > 0.5 ? 'big' : 'small';
    const amount = Math.max(1, Math.floor(player.score * 0.1));
    
    return { guess, amount };
  }
  
  public shouldRoll(): boolean {
    // AI总是选择掷骰子
    return true;
  }
}

// === 辅助函数 ===

export function getDiceResult(dice: Die[]): {
  total: number;
  result: 'big' | 'small';
  isTriple: boolean;
} {
  const total = dice.reduce((sum, die) => sum + (die.value || 0), 0);
  const result = total >= 11 ? 'big' : 'small';
  
  // 检查是否为豹子（三个相同）
  const values = dice.map(d => d.value).filter(v => v !== undefined);
  const isTriple = values.length === 3 && values.every(v => v === values[0]);
  
  return { total, result, isTriple };
} 