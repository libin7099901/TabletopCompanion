// ✂️ 石头剪刀布游戏

import {
  GameState,
  GameAction,
  GameRules,
  WinResult,
  ActionType
} from '../types/game';

// 石头剪刀布选择类型
export type RPSChoice = 'rock' | 'paper' | 'scissors';

// 游戏状态扩展
interface RPSGameState extends GameState {
  currentRound: number;
  maxRounds: number;
  choices: Record<string, RPSChoice>; // 玩家选择
  roundHistory: Array<{
    round: number;
    choices: Record<string, RPSChoice>;
    results: Record<string, 'win' | 'lose' | 'draw'>;
    winner?: string;
  }>;
}

// === 石头剪刀布规则 ===

export class RockPaperScissorsRules implements GameRules {

  validateAction(state: GameState, action: GameAction): boolean {
    if (action.type !== 'play') return false;
    if (state.phase !== 'playing') return false;

    const { choice } = action.data;
    
    // 检查选择有效性
    if (!['rock', 'paper', 'scissors'].includes(choice)) return false;
    
    // 检查玩家是否已经选择
    const rpsState = state as RPSGameState;
    return !(action.playerId in rpsState.choices);
  }

  executeAction(state: GameState, action: GameAction): GameState {
    const newState = JSON.parse(JSON.stringify(state)) as RPSGameState;
    
    if (action.type === 'play') {
      return this.executePlayAction(newState, action);
    }
    
    return newState;
  }

  private executePlayAction(state: RPSGameState, action: GameAction): RPSGameState {
    const { choice } = action.data;
    
    // 记录玩家选择
    state.choices[action.playerId] = choice;
    
    // 记录历史
    state.history.push(action);
    
    // 检查是否所有玩家都已选择
    if (Object.keys(state.choices).length === state.players.length) {
      this.resolveRound(state);
    }
    
    return state;
  }

  private resolveRound(state: RPSGameState): void {
    const results = this.calculateRoundResults(state.choices);
    const roundWinner = this.findRoundWinner(results);
    
    // 记录回合历史
    state.roundHistory.push({
      round: state.currentRound,
      choices: { ...state.choices },
      results,
      winner: roundWinner
    });
    
    // 更新分数
    if (roundWinner) {
      state.score[roundWinner] = (state.score[roundWinner] || 0) + 1;
    }
    
    // 清空当前选择
    state.choices = {};
    
    // 检查游戏是否结束
    const gameWinner = this.findGameWinner(state);
    if (gameWinner || state.currentRound >= state.maxRounds) {
      state.status = 'finished';
      state.phase = 'finished';
    } else {
      // 进入下一轮
      state.currentRound++;
      state.round = state.currentRound;
    }
  }

  private calculateRoundResults(choices: Record<string, RPSChoice>): Record<string, 'win' | 'lose' | 'draw'> {
    const results: Record<string, 'win' | 'lose' | 'draw'> = {};
    const playerIds = Object.keys(choices);
    
    if (playerIds.length === 2) {
      // 双人游戏
      const [player1, player2] = playerIds;
      const choice1 = choices[player1];
      const choice2 = choices[player2];
      
      const result = this.compareChoices(choice1, choice2);
      
      if (result === 'draw') {
        results[player1] = 'draw';
        results[player2] = 'draw';
      } else if (result === 'win') {
        results[player1] = 'win';
        results[player2] = 'lose';
      } else {
        results[player1] = 'lose';
        results[player2] = 'win';
      }
    } else {
      // 多人游戏 - 找出获胜选择
      const choiceTypes = new Set(Object.values(choices));
      
      if (choiceTypes.size === 3 || choiceTypes.size === 1) {
        // 所有选择都有或所有选择相同 = 平局
        playerIds.forEach(id => results[id] = 'draw');
      } else {
        // 两种选择 - 确定获胜选择
        const choicesArray = Array.from(choiceTypes) as RPSChoice[];
        const winningChoice = this.getWinningChoice(choicesArray[0], choicesArray[1]);
        
        playerIds.forEach(id => {
          results[id] = choices[id] === winningChoice ? 'win' : 'lose';
        });
      }
    }
    
    return results;
  }

  private compareChoices(choice1: RPSChoice, choice2: RPSChoice): 'win' | 'lose' | 'draw' {
    if (choice1 === choice2) return 'draw';
    
    const winConditions: Record<RPSChoice, RPSChoice> = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };
    
    return winConditions[choice1] === choice2 ? 'win' : 'lose';
  }

  private getWinningChoice(choice1: RPSChoice, choice2: RPSChoice): RPSChoice {
    const result = this.compareChoices(choice1, choice2);
    return result === 'win' ? choice1 : choice2;
  }

  private findRoundWinner(results: Record<string, 'win' | 'lose' | 'draw'>): string | undefined {
    const winners = Object.entries(results)
      .filter(([_, result]) => result === 'win')
      .map(([playerId, _]) => playerId);
    
    // 只有在有唯一获胜者时才返回
    return winners.length === 1 ? winners[0] : undefined;
  }

  private findGameWinner(state: RPSGameState): string | undefined {
    const winThreshold = Math.ceil(state.maxRounds / 2); // 过半获胜
    
    for (const [playerId, score] of Object.entries(state.score)) {
      if (score >= winThreshold) {
        return playerId;
      }
    }
    
    return undefined;
  }

  checkWinCondition(state: GameState): WinResult | null {
    const rpsState = state as RPSGameState;
    
    if (state.status !== 'finished') return null;
    
    const winner = this.findGameWinner(rpsState);
    
    return {
      winnerId: winner,
      isDraw: !winner,
      reason: winner ? 'rounds_won' : 'max_rounds_reached',
      finalScores: { ...state.score }
    };
  }

  getValidActions(state: GameState, playerId: string): ActionType[] {
    if (state.phase !== 'playing') return [];
    
    const rpsState = state as RPSGameState;
    
    // 检查玩家是否已经在本轮做出选择
    if (playerId in rpsState.choices) return [];
    
    return ['play'];
  }

  getNextPlayer(state: GameState): number {
    // 石头剪刀布是同时进行的，不需要切换玩家
    return state.currentPlayerIndex;
  }

  calculateScore(state: GameState, playerId: string): number {
    return state.score[playerId] || 0;
  }
}

// === 游戏创建函数 ===

export function createRockPaperScissorsGame(): {
  rules: GameRules;
  initialState: Partial<RPSGameState>;
} {
  return {
    rules: new RockPaperScissorsRules(),
    initialState: {
      id: 'rps-' + Date.now(),
      templateId: 'rockPaperScissors',
      status: 'preparing',
      phase: 'setup',
      round: 1,
      currentRound: 1,
      maxRounds: 3,
      currentPlayerIndex: 0,
      players: [],
      history: [],
      score: {},
      choices: {},
      roundHistory: [],
      startTime: new Date().toISOString(),
      settings: {
        timeLimit: 30, // 30秒做选择
        autoSkip: true,
        allowUndo: false,
        showHints: false,
        difficulty: 'easy'
      }
    }
  };
}

// === AI玩家 ===

export class RockPaperScissorsAI {
  
  public getBestChoice(state: GameState, playerId: string): RPSChoice {
    const rpsState = state as RPSGameState;
    const opponent = state.players.find(p => p.id !== playerId);
    
    if (!opponent || rpsState.roundHistory.length === 0) {
      // 没有历史数据，随机选择
      return this.getRandomChoice();
    }
    
    // 分析对手的模式
    const opponentHistory = rpsState.roundHistory
      .map(round => round.choices[opponent.id])
      .filter(choice => choice !== undefined);
    
    if (opponentHistory.length < 2) {
      return this.getRandomChoice();
    }
    
    // 预测对手下一步
    const predictedChoice = this.predictOpponentChoice(opponentHistory);
    
    // 选择克制对手的选择
    return this.getCounterChoice(predictedChoice);
  }
  
  private predictOpponentChoice(history: RPSChoice[]): RPSChoice {
    // 简单的模式识别：看最近的趋势
    const recent = history.slice(-3);
    
    // 检查是否有重复模式
    const lastChoice = recent[recent.length - 1];
    const frequency = recent.filter(choice => choice === lastChoice).length;
    
    if (frequency >= 2) {
      // 对手可能会改变策略
      const alternatives: RPSChoice[] = ['rock', 'paper', 'scissors']
        .filter(choice => choice !== lastChoice) as RPSChoice[];
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
    
    // 否则假设对手会重复上一次的选择
    return lastChoice;
  }
  
  private getCounterChoice(opponentChoice: RPSChoice): RPSChoice {
    const counters: Record<RPSChoice, RPSChoice> = {
      rock: 'paper',
      paper: 'scissors',
      scissors: 'rock'
    };
    
    return counters[opponentChoice];
  }
  
  private getRandomChoice(): RPSChoice {
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
  }
  
  public getDifficultyStrategy(difficulty: 'easy' | 'medium' | 'hard'): (state: GameState, playerId: string) => RPSChoice {
    switch (difficulty) {
      case 'easy':
        return () => this.getRandomChoice();
      
      case 'medium':
        return (state, playerId) => {
          // 50%概率使用策略，50%随机
          return Math.random() < 0.5 ? 
            this.getBestChoice(state, playerId) : 
            this.getRandomChoice();
        };
      
      case 'hard':
        return (state, playerId) => this.getBestChoice(state, playerId);
    }
  }
}

// === 工具函数 ===

export function getChoiceEmoji(choice: RPSChoice): string {
  const emojis: Record<RPSChoice, string> = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
  };
  
  return emojis[choice];
}

export function getChoiceDisplayName(choice: RPSChoice): string {
  const names: Record<RPSChoice, string> = {
    rock: '石头',
    paper: '布',
    scissors: '剪刀'
  };
  
  return names[choice];
} 