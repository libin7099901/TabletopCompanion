// 🎯 AI游戏大师服务 - GM引导和计分系统

import { Player } from '../../types/common';
import { GameState } from '../../types/game';

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: 'board' | 'card' | 'dice';
  rules: string;
}

export interface GameEvent {
  type: 'turn_start' | 'turn_end' | 'score_change' | 'game_milestone' | 'rule_violation';
  playerId: string;
  data: any;
  timestamp: number;
}

export interface GMAction {
  type: 'reminder' | 'warning' | 'celebration' | 'guidance';
  message: string;
  priority: 'low' | 'medium' | 'high';
  targetPlayer?: string;
  delay?: number; // 延迟显示(毫秒)
}

export class GameMasterService {
  private gameHistory: GameEvent[] = [];
  private turnStartTime: number = 0;
  private reminderTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 处理游戏事件，作为GM进行相应响应
   */
  public handleGameEvent(
    event: GameEvent,
    gameState: GameState,
    gameTemplate: GameTemplate
  ): GMAction[] {
    this.gameHistory.push(event);
    const actions: GMAction[] = [];

    switch (event.type) {
      case 'turn_start':
        actions.push(...this.handleTurnStart(event, gameState, gameTemplate));
        break;
      case 'turn_end':
        actions.push(...this.handleTurnEnd(event, gameState, gameTemplate));
        break;
      case 'score_change':
        actions.push(...this.handleScoreChange(event, gameState, gameTemplate));
        break;
      case 'game_milestone':
        actions.push(...this.handleGameMilestone(event, gameState, gameTemplate));
        break;
      case 'rule_violation':
        actions.push(...this.handleRuleViolation(event, gameState, gameTemplate));
        break;
    }

    return actions;
  }

  /**
   * 处理回合开始
   */
  private handleTurnStart(
    event: GameEvent,
    gameState: GameState,
    gameTemplate: GameTemplate
  ): GMAction[] {
    const actions: GMAction[] = [];
    const currentPlayer = gameState.players.find(p => p.id === event.playerId);
    
    if (!currentPlayer) return actions;

    this.turnStartTime = Date.now();

    // 基础回合开始提醒
    actions.push({
      type: 'reminder',
      message: `${currentPlayer.name}，轮到你了！第${gameState.round}回合开始`,
      priority: 'high',
      targetPlayer: currentPlayer.id
    });

    // 游戏特定引导
    switch (gameTemplate.id) {
      case 'gomoku':
        actions.push(...this.getGomokuTurnGuidance(gameState, currentPlayer));
        break;
      case 'card_compare':
        actions.push(...this.getCardGameTurnGuidance(gameState, currentPlayer));
        break;
      case 'dice_guess':
        actions.push(...this.getDiceGameTurnGuidance(gameState, currentPlayer));
        break;
    }

    // 设置回合超时提醒
    this.setTurnTimeoutReminder(currentPlayer.id);

    return actions;
  }

  /**
   * 处理回合结束
   */
  private handleTurnEnd(
    event: GameEvent,
    gameState: GameState,
    _gameTemplate: GameTemplate
  ): GMAction[] {
    const actions: GMAction[] = [];
    const turnDuration = Date.now() - this.turnStartTime;
    
    // 清除超时提醒
    this.clearTurnTimeoutReminder(event.playerId);

    // 快速行动鼓励
    if (turnDuration < 5000) {
      actions.push({
        type: 'celebration',
        message: '干净利落的一步！👍',
        priority: 'low',
        targetPlayer: event.playerId
      });
    }

    // 为下一个玩家做准备
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];

    if (nextPlayer) {
      actions.push({
        type: 'guidance',
        message: `请准备，马上轮到${nextPlayer.name}`,
        priority: 'medium',
        delay: 1000
      });
    }

    return actions;
  }

  /**
   * 处理分数变化
   */
  private handleScoreChange(
    event: GameEvent,
    gameState: GameState,
    _gameTemplate: GameTemplate
  ): GMAction[] {
    const actions: GMAction[] = [];
    const player = gameState.players.find(p => p.id === event.playerId);
    
    if (!player) return actions;

    const { oldScore, newScore } = event.data;
    const scoreDiff = newScore - oldScore;

    if (scoreDiff > 0) {
      // 得分庆祝
      const message = this.getScoreMessage(scoreDiff, newScore, gameState.players);
      actions.push({
        type: 'celebration',
        message,
        priority: 'medium',
        targetPlayer: player.id
      });

      // 检查是否接近胜利
      const winThreshold = this.getWinThreshold(gameState.templateId);
      if (winThreshold && newScore >= winThreshold * 0.8) {
        actions.push({
          type: 'reminder',
          message: `${player.name}距离胜利越来越近了！`,
          priority: 'high'
        });
      }
    } else if (scoreDiff < 0) {
      // 失分安慰
      actions.push({
        type: 'guidance',
        message: `别灰心，${player.name}！还有机会追回来`,
        priority: 'medium',
        targetPlayer: player.id
      });
    }

    return actions;
  }

  /**
   * 处理游戏里程碑
   */
  private handleGameMilestone(
    event: GameEvent,
    gameState: GameState,
    _gameTemplate: GameTemplate
  ): GMAction[] {
    const actions: GMAction[] = [];
    const { milestone } = event.data;

    switch (milestone) {
      case 'halfway':
        actions.push({
          type: 'reminder',
          message: `游戏已进行到一半！当前回合：${gameState.round}`,
          priority: 'medium'
        });
        break;
      case 'final_round':
        actions.push({
          type: 'reminder',
          message: '🔥 最后一轮了！决战时刻到了！',
          priority: 'high'
        });
        break;
      case 'overtime':
        actions.push({
          type: 'reminder',
          message: '⚡ 加时赛开始！谁能笑到最后？',
          priority: 'high'
        });
        break;
    }

    return actions;
  }

  /**
   * 处理规则违反
   */
  private handleRuleViolation(
    event: GameEvent,
    _gameState: GameState,
    _gameTemplate: GameTemplate
  ): GMAction[] {
    const actions: GMAction[] = [];
    const { violation, player } = event.data;

    actions.push({
      type: 'warning',
      message: `${player.name}，${violation}。请重新操作。`,
      priority: 'high',
      targetPlayer: player.id
    });

    return actions;
  }

  /**
   * 五子棋回合引导
   */
  private getGomokuTurnGuidance(gameState: GameState, player: Player): GMAction[] {
    const actions: GMAction[] = [];
    
    // 分析当前局面
    const moveCount = this.getTotalMoves(gameState);
    
    if (moveCount < 3) {
      actions.push({
        type: 'guidance',
        message: '开局阶段，建议抢占中心位置',
        priority: 'medium',
        targetPlayer: player.id
      });
    } else if (moveCount > 10) {
      actions.push({
        type: 'guidance',
        message: '中局阶段，注意攻守兼备',
        priority: 'medium',
        targetPlayer: player.id
      });
    }

    return actions;
  }

  /**
   * 纸牌游戏回合引导
   */
  private getCardGameTurnGuidance(gameState: GameState, player: Player): GMAction[] {
    const actions: GMAction[] = [];
    
    actions.push({
      type: 'guidance',
      message: '点击"抽牌"开始这一轮',
      priority: 'high',
      targetPlayer: player.id
    });

    // 根据当前分数给出策略建议 - 从gameState获取分数
    const playerScore = this.getPlayerScore(gameState, player.id);
    if (playerScore < 0) {
      actions.push({
        type: 'guidance',
        message: '运气不太好，保持心态！',
        priority: 'low',
        targetPlayer: player.id,
        delay: 2000
      });
    }

    return actions;
  }

  /**
   * 骰子游戏回合引导
   */
  private getDiceGameTurnGuidance(gameState: GameState, player: Player): GMAction[] {
    const actions: GMAction[] = [];
    
    const playerScore = this.getPlayerScore(gameState, player.id);
    if (playerScore > 80) {
      actions.push({
        type: 'guidance',
        message: '筹码充足，可以考虑冒险一下！',
        priority: 'medium',
        targetPlayer: player.id
      });
    } else if (playerScore < 20) {
      actions.push({
        type: 'guidance',
        message: '筹码不多了，建议保守策略',
        priority: 'high',
        targetPlayer: player.id
      });
    } else {
      actions.push({
        type: 'guidance',
        message: '选择你的下注策略：大或小？',
        priority: 'medium',
        targetPlayer: player.id
      });
    }

    return actions;
  }

  /**
   * 设置回合超时提醒
   */
  private setTurnTimeoutReminder(playerId: string): void {
    // 15秒后第一次提醒
    const reminder1 = setTimeout(() => {
      this.onTurnTimeout(playerId, 'first');
    }, 15000);

    // 25秒后最后提醒
    const reminder2 = setTimeout(() => {
      this.onTurnTimeout(playerId, 'final');
    }, 25000);

    this.reminderTimers.set(playerId, reminder1);
    this.reminderTimers.set(`${playerId}_final`, reminder2);
  }

  /**
   * 清除回合超时提醒
   */
  private clearTurnTimeoutReminder(playerId: string): void {
    const timer1 = this.reminderTimers.get(playerId);
    const timer2 = this.reminderTimers.get(`${playerId}_final`);
    
    if (timer1) {
      clearTimeout(timer1);
      this.reminderTimers.delete(playerId);
    }
    
    if (timer2) {
      clearTimeout(timer2);
      this.reminderTimers.delete(`${playerId}_final`);
    }
  }

  /**
   * 处理回合超时
   */
  private onTurnTimeout(playerId: string, type: 'first' | 'final'): void {
    const message = type === 'first' 
      ? '⏰ 思考时间过半，请尽快行动'
      : '🚨 时间快到了！请立即行动！';
    
    // 这里应该通过事件系统发送提醒
    console.log(`[GM提醒] ${message} (玩家: ${playerId})`);
  }

  /**
   * 生成得分庆祝消息
   */
  private getScoreMessage(scoreDiff: number, newScore: number, allPlayers: any[]): string {
    const maxScore = Math.max(...allPlayers.map(p => p.score || 0));
    const isLeading = newScore === maxScore;

    if (scoreDiff >= 10) {
      return `🎉 精彩！一次性获得${scoreDiff}分！`;
    } else if (isLeading) {
      return `🏆 太棒了！你暂时领先，当前${newScore}分`;
    } else {
      return `👍 不错！获得${scoreDiff}分，当前${newScore}分`;
    }
  }

  /**
   * 获取获胜分数阈值
   */
  private getWinThreshold(templateId: string): number | null {
    switch (templateId) {
      case 'dice_guess':
        return 200; // 骰子游戏200分获胜
      case 'card_compare':
        return 50;  // 纸牌游戏50分获胜
      default:
        return null; // 五子棋等无分数限制
    }
  }

  /**
   * 获取总步数(仅五子棋)
   */
  private getTotalMoves(gameState: GameState): number {
    // 这里应该根据具体游戏状态计算
    // 简化实现，返回回合数
    return gameState.round;
  }

  /**
   * 获取当前游戏统计
   */
  public getGameStats(gameState: GameState): {
    totalTurns: number;
    averageTurnTime: number;
    leadingPlayer: Player | null;
    gameProgress: number; // 0-1
  } {
    const totalTurns = gameState.round;
    const averageTurnTime = this.calculateAverageTurnTime();
    const leadingPlayer = this.getLeadingPlayer(gameState.players);
    const gameProgress = this.calculateGameProgress(gameState);

    return {
      totalTurns,
      averageTurnTime,
      leadingPlayer,
      gameProgress
    };
  }

  /**
   * 计算平均回合时间
   */
  private calculateAverageTurnTime(): number {
    // 简化实现
    return 15000; // 15秒
  }

  /**
   * 获取领先玩家
   */
  private getLeadingPlayer(players: any[]): any | null {
    if (players.length === 0) return null;
    
    return players.reduce((leading, current) => 
      (current.score || 0) > (leading.score || 0) ? current : leading
    );
  }

  /**
   * 计算游戏进度
   */
  private calculateGameProgress(gameState: GameState): number {
    // 根据不同游戏类型计算进度
    switch (gameState.templateId) {
      case 'gomoku':
        // 五子棋按步数计算，假设50步为满局
        return Math.min(gameState.round / 50, 1);
      case 'card_compare':
        // 纸牌游戏按最高分计算
        const maxScore = Math.max(...gameState.players.map(p => p.score || 0));
        return Math.min(maxScore / 50, 1);
      case 'dice_guess':
        // 骰子游戏按筹码计算
        const maxChips = Math.max(...gameState.players.map(p => p.score || 0));
        return Math.min(maxChips / 200, 1);
      default:
        return gameState.round / 20; // 默认20回合
    }
  }

  /**
   * 从游戏状态获取玩家分数
   */
  private getPlayerScore(gameState: GameState, playerId: string): number {
    const player = gameState.players.find(p => p.id === playerId);
    return player?.score || 0;
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    // 清理所有计时器
    this.reminderTimers.forEach(timer => clearTimeout(timer));
    this.reminderTimers.clear();
    this.gameHistory = [];
  }
} 