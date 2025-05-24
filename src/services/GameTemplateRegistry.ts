// 🎮 游戏模板注册中心

import { GameRules } from '../types/game';
import { createGomokuGame } from '../games/GomokuGame';
import { createCardCompareGame } from '../games/CardCompareGame';
import { createDiceGuessGame } from '../games/DiceGuessGame';

// 简化的游戏模板接口
export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: 'card' | 'board' | 'dice' | 'custom';
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail?: string;
  rules: string; // 规则文本
  components: Array<{
    id: string;
    type: string;
    name: string;
    properties: Record<string, any>;
  }>;
  // 添加游戏工厂函数
  createGame: () => {
    rules: GameRules;
    initialState: any;
  };
}

class GameTemplateRegistry {
  private templates: Map<string, GameTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    // 五子棋
    this.register({
      id: 'gomoku',
      name: '五子棋',
      description: '经典的策略棋类游戏，率先连成五子者获胜',
      type: 'board',
      minPlayers: 2,
      maxPlayers: 2,
      estimatedTime: 15,
      difficulty: 'medium',
      thumbnail: '♟️',
      rules: `
游戏规则：
1. 两名玩家轮流在15×15的棋盘上放置棋子
2. 率先在横、竖、斜任意方向连成5个棋子的玩家获胜
3. 黑子先行，白子后行
4. 棋子放置后不可移动
      `.trim(),
      components: [
        {
          id: 'board',
          type: 'board',
          name: '15×15棋盘',
          properties: { size: '15x15', squares: 225 }
        },
        {
          id: 'pieces',
          type: 'pieces',
          name: '黑白棋子',
          properties: { colors: ['black', 'white'] }
        }
      ],
      createGame: createGomokuGame
    });

    // 比大小
    this.register({
      id: 'card_compare',
      name: '比大小',
      description: '简单有趣的纸牌游戏，比较手牌大小',
      type: 'card',
      minPlayers: 2,
      maxPlayers: 4,
      estimatedTime: 10,
      difficulty: 'easy',
      thumbnail: '🃏',
      rules: `
游戏规则：
1. 每轮每位玩家抽取一张牌
2. 比较牌面大小，A最大，2最小
3. 大小相同时比较花色：黑桃>红心>方块>梅花
4. 获胜者得1分，率先得到3分者获胜
      `.trim(),
      components: [
        {
          id: 'deck',
          type: 'deck',
          name: '标准52张扑克牌',
          properties: { cards: 52, suits: 4, ranks: 13 }
        }
      ],
      createGame: createCardCompareGame
    });

    // 猜大小
    this.register({
      id: 'dice_guess',
      name: '猜大小',
      description: '经典的骰子赌博游戏，猜测骰子点数大小',
      type: 'dice',
      minPlayers: 2,
      maxPlayers: 6,
      estimatedTime: 10,
      difficulty: 'easy',
      thumbnail: '🎲',
      rules: `
游戏规则：
1. 每位玩家初始有100筹码
2. 每轮玩家下注猜测骰子总点数的大小
3. 大：11-18点，小：3-10点
4. 庄家掷3个骰子，猜中者获得双倍奖金
5. 破产或达到5轮后，筹码最多者获胜
      `.trim(),
      components: [
        {
          id: 'dice_set',
          type: 'dice',
          name: '三个六面骰子',
          properties: { count: 3, sides: 6 }
        },
        {
          id: 'chips',
          type: 'tokens',
          name: '筹码',
          properties: { initial: 100 }
        }
      ],
      createGame: createDiceGuessGame
    });

    // 石头剪刀布
    this.register({
      id: 'rock_paper_scissors',
      name: '石头剪刀布',
      description: '经典的手势游戏，三局两胜制',
      type: 'custom',
      minPlayers: 2,
      maxPlayers: 8,
      estimatedTime: 5,
      difficulty: 'easy',
      thumbnail: '✂️',
      rules: `
游戏规则：
1. 所有玩家同时选择：石头、剪刀或布
2. 石头胜剪刀，剪刀胜布，布胜石头
3. 采用三局两胜制
4. 多人游戏时，每轮淘汰输的玩家
      `.trim(),
      components: [
        {
          id: 'choices',
          type: 'tokens',
          name: '选择标记',
          properties: { options: ['rock', 'paper', 'scissors'] }
        }
      ],
      createGame: () => {
        // 简化的石头剪刀布实现
        return {
          rules: {} as GameRules,
          initialState: { phase: 'playing' }
        };
      }
    });
  }

  // === 公共方法 ===

  public register(template: GameTemplate): void {
    this.templates.set(template.id, template);
  }

  public getTemplate(id: string): GameTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): GameTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplatesByType(type: GameTemplate['type']): GameTemplate[] {
    return this.getAllTemplates().filter(template => template.type === type);
  }

  public getTemplatesByDifficulty(difficulty: GameTemplate['difficulty']): GameTemplate[] {
    return this.getAllTemplates().filter(template => template.difficulty === difficulty);
  }

  public getTemplatesByPlayerCount(playerCount: number): GameTemplate[] {
    return this.getAllTemplates().filter(
      template => playerCount >= template.minPlayers && playerCount <= template.maxPlayers
    );
  }

  public search(query: string): GameTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTemplates().filter(
      template =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery)
    );
  }

  // === 游戏创建 ===

  public createGameInstance(templateId: string) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return template.createGame();
  }

  // === 统计信息 ===

  public getStats() {
    const templates = this.getAllTemplates();
    
    return {
      total: templates.length,
      byType: {
        card: templates.filter(t => t.type === 'card').length,
        board: templates.filter(t => t.type === 'board').length,
        dice: templates.filter(t => t.type === 'dice').length,
        custom: templates.filter(t => t.type === 'custom').length
      },
      byDifficulty: {
        easy: templates.filter(t => t.difficulty === 'easy').length,
        medium: templates.filter(t => t.difficulty === 'medium').length,
        hard: templates.filter(t => t.difficulty === 'hard').length
      },
      averageTime: Math.round(
        templates.reduce((sum, t) => sum + t.estimatedTime, 0) / templates.length
      )
    };
  }
}

// 单例实例
export const gameTemplateRegistry = new GameTemplateRegistry();

// 便捷函数
export function getGameTemplate(id: string) {
  return gameTemplateRegistry.getTemplate(id);
}

export function getAllGameTemplates() {
  return gameTemplateRegistry.getAllTemplates();
}

export function createGameFromTemplate(templateId: string) {
  return gameTemplateRegistry.createGameInstance(templateId);
} 