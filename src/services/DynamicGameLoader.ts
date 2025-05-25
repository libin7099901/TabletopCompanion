// 🎮 动态游戏模板加载器 - 支持模块化游戏加载

import { GameRules, GameState } from '../types/game';

// 扩展的游戏模板接口
export interface ExtendedGameTemplate {
  // 基础信息
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  
  // 游戏分类
  category: 'strategy' | 'party' | 'card' | 'dice' | 'puzzle' | 'action' | 'simulation';
  tags: string[];
  
  // 玩家配置
  minPlayers: number;
  maxPlayers: number;
  optimalPlayers?: number;
  
  // 时间和难度
  estimatedTime: number; // 分钟
  setupTime?: number; // 设置时间（分钟）
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  complexity: number; // 1-10 复杂度评分
  
  // 视觉资源
  thumbnail: string;
  images?: string[];
  banner?: string;
  
  // 游戏规则和组件
  rules: {
    summary: string;
    fullText: string;
    quickStart?: string;
    examples?: Array<{
      title: string;
      description: string;
      image?: string;
    }>;
  };
  
  components: GameComponent[];
  
  // 功能特性
  features: {
    aiSupport: boolean;
    spectatorMode: boolean;
    realTimePlay: boolean;
    pauseResume: boolean;
    replaySystem: boolean;
    statistics: boolean;
    customization: boolean;
  };
  
  // 加载配置
  loadConfig: {
    lazy?: boolean; // 是否懒加载
    dependencies?: string[]; // 依赖的其他模板
    preload?: string[]; // 需要预加载的资源
  };
  
  // 游戏工厂函数
  createGame: () => Promise<{
    rules: GameRules;
    initialState: Partial<GameState>;
    ui?: GameUIConfig;
  }>;
  
  // 元数据
  metadata: {
    created: Date;
    updated: Date;
    downloads?: number;
    rating?: number;
    reviews?: number;
  };
}

// 游戏组件接口
export interface GameComponent {
  id: string;
  type: 'board' | 'cards' | 'dice' | 'tokens' | 'timer' | 'score' | 'custom';
  name: string;
  description?: string;
  properties: Record<string, any>;
  visualConfig?: {
    style?: string;
    customCSS?: string;
    interactive?: boolean;
  };
}

// 游戏UI配置
export interface GameUIConfig {
  layout: 'grid' | 'flex' | 'custom';
  theme?: string;
  components: Array<{
    id: string;
    component: string;
    props?: Record<string, any>;
    position?: { x: number; y: number; width?: number; height?: number };
  }>;
  styles?: Record<string, string>;
}

// 动态加载器类
export class DynamicGameLoader {
  private loadedTemplates = new Map<string, ExtendedGameTemplate>();
  private loadingPromises = new Map<string, Promise<ExtendedGameTemplate>>();
  private cache = new Map<string, any>();
  
  constructor() {
    this.initializeDefaultTemplates();
  }
  
  // === 模板加载 ===
  
  async loadTemplate(templateId: string): Promise<ExtendedGameTemplate> {
    // 检查缓存
    if (this.loadedTemplates.has(templateId)) {
      return this.loadedTemplates.get(templateId)!;
    }
    
    // 检查是否正在加载
    if (this.loadingPromises.has(templateId)) {
      return this.loadingPromises.get(templateId)!;
    }
    
    // 开始加载
    const loadPromise = this.performLoad(templateId);
    this.loadingPromises.set(templateId, loadPromise);
    
    try {
      const template = await loadPromise;
      this.loadedTemplates.set(templateId, template);
      this.loadingPromises.delete(templateId);
      return template;
    } catch (error) {
      this.loadingPromises.delete(templateId);
      throw error;
    }
  }
  
  private async performLoad(templateId: string): Promise<ExtendedGameTemplate> {
    try {
      // 尝试动态导入
      const module = await import(`../games/${templateId}Template.js`);
      return module.default || module.template;
    } catch (importError) {
      // 回退到内置模板
      return this.getBuiltinTemplate(templateId);
    }
  }
  
  // === 批量加载 ===
  
  async loadMultiple(templateIds: string[]): Promise<ExtendedGameTemplate[]> {
    const loadPromises = templateIds.map(id => this.loadTemplate(id));
    return Promise.all(loadPromises);
  }
  
  async preloadAll(): Promise<void> {
    const allIds = Array.from(this.getAvailableTemplateIds());
    await this.loadMultiple(allIds);
  }
  
  // === 模板注册 ===
  
  registerTemplate(template: ExtendedGameTemplate): void {
    this.loadedTemplates.set(template.id, template);
  }
  
  unregisterTemplate(templateId: string): boolean {
    this.cache.delete(templateId);
    return this.loadedTemplates.delete(templateId);
  }
  
  // === 查询方法 ===
  
  getTemplate(templateId: string): ExtendedGameTemplate | undefined {
    return this.loadedTemplates.get(templateId);
  }
  
  getAllTemplates(): ExtendedGameTemplate[] {
    return Array.from(this.loadedTemplates.values());
  }
  
  getTemplatesByCategory(category: ExtendedGameTemplate['category']): ExtendedGameTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }
  
  getTemplatesByTags(tags: string[]): ExtendedGameTemplate[] {
    return this.getAllTemplates().filter(template => 
      tags.some(tag => template.tags.includes(tag))
    );
  }
  
  getTemplatesByPlayerCount(playerCount: number): ExtendedGameTemplate[] {
    return this.getAllTemplates().filter(template => 
      playerCount >= template.minPlayers && playerCount <= template.maxPlayers
    );
  }
  
  getTemplatesByDifficulty(difficulty: ExtendedGameTemplate['difficulty']): ExtendedGameTemplate[] {
    return this.getAllTemplates().filter(template => template.difficulty === difficulty);
  }
  
  searchTemplates(query: string): ExtendedGameTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.getAllTemplates().filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
  
  // === 游戏实例创建 ===
  
  async createGameInstance(templateId: string) {
    const template = await this.loadTemplate(templateId);
    return template.createGame();
  }
  
  // === 内置模板 ===
  
  private getAvailableTemplateIds(): Set<string> {
    // 只返回实际已实现的内置模板ID
    return new Set([
      'gomoku',           // 五子棋
      'ticTacToe',        // 井字棋  
      'rockPaperScissors', // 石头剪刀布
      'cardCompare',      // 比大小
      'diceGuess'         // 猜大小
    ]);
  }
  
  private getBuiltinTemplate(templateId: string): ExtendedGameTemplate {
    const builtinTemplates = this.createBuiltinTemplates();
    const template = builtinTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template '${templateId}' not found`);
    }
    
    return template;
  }
  
  private initializeDefaultTemplates(): void {
    const templates = this.createBuiltinTemplates();
    templates.forEach(template => {
      this.loadedTemplates.set(template.id, template);
    });
  }
  
  private createBuiltinTemplates(): ExtendedGameTemplate[] {
    return [
      // 五子棋
      {
        id: 'gomoku',
        name: '五子棋',
        description: '经典的策略棋类游戏，率先连成五子者获胜',
        version: '1.0.0',
        author: '桌游伴侣团队',
        category: 'strategy',
        tags: ['棋类', '策略', '经典', '双人'],
        minPlayers: 2,
        maxPlayers: 2,
        optimalPlayers: 2,
        estimatedTime: 15,
        setupTime: 1,
        difficulty: 'medium',
        complexity: 5,
        thumbnail: '♟️',
        rules: {
          summary: '率先在横、竖、斜任意方向连成5个棋子的玩家获胜',
          fullText: `
游戏规则：
1. 两名玩家轮流在15×15的棋盘上放置棋子
2. 率先在横、竖、斜任意方向连成5个棋子的玩家获胜
3. 黑子先行，白子后行
4. 棋子放置后不可移动
5. 禁手规则：黑棋禁止双三、双四、长连
          `.trim(),
          quickStart: '点击棋盘空白处放置棋子，先连成五子获胜'
        },
        components: [
          {
            id: 'board',
            type: 'board',
            name: '15×15棋盘',
            properties: { 
              size: '15x15', 
              squares: 225,
              gridStyle: 'lines',
              starPoints: true
            }
          },
          {
            id: 'pieces',
            type: 'tokens',
            name: '黑白棋子',
            properties: { 
              colors: ['black', 'white'],
              style: 'circular',
              unlimited: true
            }
          }
        ],
        features: {
          aiSupport: true,
          spectatorMode: true,
          realTimePlay: true,
          pauseResume: true,
          replaySystem: true,
          statistics: true,
          customization: false
        },
        loadConfig: {
          lazy: false,
          dependencies: [],
          preload: ['board', 'pieces']
        },
        createGame: async () => {
          const { createGomokuGame } = await import('../games/GomokuGame');
          return createGomokuGame();
        },
        metadata: {
          created: new Date('2024-01-01'),
          updated: new Date('2024-12-01'),
          downloads: 1500,
          rating: 4.7,
          reviews: 123
        }
      },
      
      // 井字棋
      {
        id: 'ticTacToe',
        name: '井字棋',
        description: '简单快速的策略游戏，在3×3棋盘上率先连成三子获胜',
        version: '1.0.0',
        author: '桌游伴侣团队',
        category: 'strategy',
        tags: ['棋类', '简单', '快速', '双人', '经典'],
        minPlayers: 2,
        maxPlayers: 2,
        optimalPlayers: 2,
        estimatedTime: 5,
        setupTime: 0,
        difficulty: 'beginner',
        complexity: 1,
        thumbnail: '⭕',
        rules: {
          summary: '在3×3棋盘上率先连成三子的玩家获胜',
          fullText: `
游戏规则：
1. 两名玩家轮流在3×3的棋盘上放置标记
2. 率先在横、竖、斜任意方向连成3个标记的玩家获胜
3. 先手玩家使用X标记，后手玩家使用O标记
4. 如果棋盘填满仍无人获胜，则为平局
          `.trim(),
          quickStart: '点击空格放置标记，率先连成三子获胜',
          examples: [
            {
              title: '获胜条件',
              description: '横、竖、斜任意方向连成三子即可获胜'
            }
          ]
        },
        components: [
          {
            id: 'board',
            type: 'board',
            name: '3×3棋盘',
            properties: { 
              size: '3x3', 
              squares: 9,
              gridStyle: 'grid',
              interactive: true
            }
          },
          {
            id: 'markers',
            type: 'tokens',
            name: 'X和O标记',
            properties: { 
              symbols: ['X', 'O'],
              style: 'text',
              unlimited: true
            }
          }
        ],
        features: {
          aiSupport: true,
          spectatorMode: false,
          realTimePlay: true,
          pauseResume: false,
          replaySystem: true,
          statistics: true,
          customization: false
        },
        loadConfig: {
          lazy: false,
          dependencies: [],
          preload: ['board', 'markers']
        },
        createGame: async () => {
          const { createTicTacToeGame } = await import('../games/TicTacToeGame');
          return createTicTacToeGame();
        },
        metadata: {
          created: new Date('2024-01-01'),
          updated: new Date('2024-12-01'),
          downloads: 3200,
          rating: 4.1,
          reviews: 245
        }
      },
      
      // 石头剪刀布
      {
        id: 'rockPaperScissors',
        name: '石头剪刀布',
        description: '经典的手势游戏，支持多人同时对战',
        version: '1.0.0',
        author: '桌游伴侣团队',
        category: 'party',
        tags: ['手势', '派对', '多人', '快速', '运气'],
        minPlayers: 2,
        maxPlayers: 8,
        optimalPlayers: 3,
        estimatedTime: 5,
        setupTime: 0,
        difficulty: 'beginner',
        complexity: 1,
        thumbnail: '✂️',
        rules: {
          summary: '同时出手势，石头胜剪刀，剪刀胜布，布胜石头',
          fullText: `
游戏规则：
1. 所有玩家同时选择：石头、剪刀或布
2. 石头胜剪刀，剪刀胜布，布胜石头
3. 采用三局两胜制
4. 多人游戏时，每轮选择获胜手势的玩家得分
5. 所有选择相同或三种选择都有时为平局
          `.trim(),
          quickStart: '选择手势，同时出招，看谁获胜',
          examples: [
            {
              title: '基本规则',
              description: '石头🪨 胜 剪刀✂️，剪刀✂️ 胜 布📄，布📄 胜 石头🪨'
            },
            {
              title: '多人游戏',
              description: '选择获胜手势的所有玩家都会得分'
            }
          ]
        },
        components: [
          {
            id: 'choices',
            type: 'tokens',
            name: '手势选择',
            properties: { 
              gestures: ['rock', 'paper', 'scissors'],
              emojis: ['🪨', '📄', '✂️'],
              simultaneous: true
            }
          },
          {
            id: 'timer',
            type: 'timer',
            name: '选择倒计时',
            properties: { 
              duration: 10,
              showWarning: true
            }
          }
        ],
        features: {
          aiSupport: true,
          spectatorMode: true,
          realTimePlay: true,
          pauseResume: false,
          replaySystem: true,
          statistics: true,
          customization: true
        },
        loadConfig: {
          lazy: false,
          dependencies: [],
          preload: ['choices']
        },
        createGame: async () => {
          const { createRockPaperScissorsGame } = await import('../games/RockPaperScissorsGame');
          return createRockPaperScissorsGame();
        },
        metadata: {
          created: new Date('2024-01-01'),
          updated: new Date('2024-12-01'),
          downloads: 2800,
          rating: 4.3,
          reviews: 189
        }
      },
      
      // 比大小
      {
        id: 'cardCompare',
        name: '比大小',
        description: '简单有趣的纸牌游戏，比较手牌大小决胜负',
        version: '1.0.0',
        author: '桌游伴侣团队',
        category: 'card',
        tags: ['纸牌', '简单', '快速', '多人'],
        minPlayers: 2,
        maxPlayers: 4,
        optimalPlayers: 3,
        estimatedTime: 10,
        setupTime: 1,
        difficulty: 'easy',
        complexity: 2,
        thumbnail: '🃏',
        rules: {
          summary: '比较牌面大小，大者获胜得分，率先得到3分者赢得游戏',
          fullText: `
游戏规则：
1. 每轮每位玩家抽取一张牌
2. 比较牌面大小，A最大，2最小
3. 大小相同时比较花色：黑桃>红心>方块>梅花
4. 获胜者得1分，率先得到3分者获胜
5. 平局时所有人重新抽牌
          `.trim(),
          quickStart: '点击"抽牌"按钮，看谁的牌最大',
          examples: [
            {
              title: '基础比较',
              description: 'A > K > Q > J > 10 > ... > 3 > 2'
            },
            {
              title: '花色比较',
              description: '相同点数时：♠ > ♥ > ♦ > ♣'
            }
          ]
        },
        components: [
          {
            id: 'deck',
            type: 'cards',
            name: '标准52张扑克牌',
            properties: { 
              cards: 52, 
              suits: 4, 
              ranks: 13,
              style: 'poker',
              shuffle: true
            }
          },
          {
            id: 'score',
            type: 'score',
            name: '得分板',
            properties: { maxScore: 3 }
          }
        ],
        features: {
          aiSupport: true,
          spectatorMode: false,
          realTimePlay: true,
          pauseResume: false,
          replaySystem: false,
          statistics: true,
          customization: true
        },
        loadConfig: {
          lazy: false,
          dependencies: [],
          preload: ['deck']
        },
        createGame: async () => {
          const { createCardCompareGame } = await import('../games/CardCompareGame');
          return createCardCompareGame();
        },
        metadata: {
          created: new Date('2024-01-01'),
          updated: new Date('2024-12-01'),
          downloads: 2100,
          rating: 4.2,
          reviews: 87
        }
      },
      
      // 猜大小
      {
        id: 'diceGuess',
        name: '猜大小',
        description: '经典的骰子赌博游戏，猜测骰子点数大小赢取筹码',
        version: '1.0.0',
        author: '桌游伴侣团队',
        category: 'dice',
        tags: ['骰子', '博弈', '筹码', '运气'],
        minPlayers: 2,
        maxPlayers: 6,
        optimalPlayers: 4,
        estimatedTime: 10,
        setupTime: 1,
        difficulty: 'easy',
        complexity: 3,
        thumbnail: '🎲',
        rules: {
          summary: '下注猜测骰子总点数大小，猜中获得双倍奖金',
          fullText: `
游戏规则：
1. 每位玩家初始有100筹码
2. 每轮玩家下注猜测骰子总点数的大小
3. 大：11-18点，小：3-10点  
4. 庄家掷3个骰子，猜中者获得双倍奖金
5. 破产或达到5轮后，筹码最多者获胜
6. 连续猜中可获得连击奖励
          `.trim(),
          quickStart: '选择大小，下注筹码，等待开奖',
          examples: [
            {
              title: '下注示例',
              description: '下注50筹码猜"大"，如果总点数≥11则获得100筹码'
            }
          ]
        },
        components: [
          {
            id: 'diceSet',
            type: 'dice',
            name: '三个六面骰子',
            properties: { 
              count: 3, 
              sides: 6,
              style: 'classic',
              animated: true
            }
          },
          {
            id: 'chips',
            type: 'tokens',
            name: '筹码',
            properties: { 
              initial: 100,
              denominations: [1, 5, 10, 25, 50],
              colors: ['white', 'red', 'green', 'black', 'purple']
            }
          },
          {
            id: 'betArea',
            type: 'custom',
            name: '下注区域',
            properties: { 
              areas: ['big', 'small'],
              minBet: 1,
              maxBet: 50
            }
          }
        ],
        features: {
          aiSupport: true,
          spectatorMode: true,
          realTimePlay: true,
          pauseResume: true,
          replaySystem: true,
          statistics: true,
          customization: true
        },
        loadConfig: {
          lazy: false,
          dependencies: [],
          preload: ['diceSet', 'chips']
        },
        createGame: async () => {
          const { createDiceGuessGame } = await import('../games/DiceGuessGame');
          return createDiceGuessGame();
        },
        metadata: {
          created: new Date('2024-01-01'),
          updated: new Date('2024-12-01'),
          downloads: 1800,
          rating: 4.5,
          reviews: 156
        }
      }
    ];
  }
  
  // === 实用方法 ===
  
  getStats() {
    const templates = this.getAllTemplates();
    return {
      total: templates.length,
      byCategory: this.groupByCategory(templates),
      byDifficulty: this.groupByDifficulty(templates),
      loaded: this.loadedTemplates.size,
      cached: this.cache.size
    };
  }
  
  private groupByCategory(templates: ExtendedGameTemplate[]) {
    return templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  private groupByDifficulty(templates: ExtendedGameTemplate[]) {
    return templates.reduce((acc, template) => {
      acc[template.difficulty] = (acc[template.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
  
  clearCache(): void {
    this.cache.clear();
  }
  
  getLoadedTemplateIds(): string[] {
    return Array.from(this.loadedTemplates.keys());
  }
}

// 导出默认实例供全局使用
export const gameLoader = new DynamicGameLoader();

// 默认导出类
export default DynamicGameLoader; 