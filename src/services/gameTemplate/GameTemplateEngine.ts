import { Player } from '../../types/common';

// 基础游戏模板接口
export interface GameTemplate {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'card' | 'board' | 'dice' | 'custom';
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // 预计游戏时长（分钟）
  rules: GameRules;
  assets: GameAssets;
  metadata: GameMetadata;
}

// 游戏规则定义
export interface GameRules {
  setup: SetupRules;
  gameplay: GameplayRules;
  scoring: ScoringRules;
  endConditions: EndCondition[];
  actions: GameAction[];
}

// 游戏设置规则
export interface SetupRules {
  initialState: any;
  playerSetup: PlayerSetupRule[];
  boardSetup?: BoardSetupRule;
  cardSetup?: CardSetupRule;
}

// 玩家设置规则
export interface PlayerSetupRule {
  property: string;
  value: any;
  condition?: string;
}

// 棋盘设置规则
export interface BoardSetupRule {
  size: { width: number; height: number };
  initialPieces: PiecePosition[];
  specialTiles?: SpecialTile[];
}

// 棋子位置
export interface PiecePosition {
  id: string;
  type: string;
  position: { x: number; y: number };
  owner?: string;
  properties?: Record<string, any>;
}

// 特殊格子
export interface SpecialTile {
  position: { x: number; y: number };
  type: string;
  effect: string;
}

// 卡牌设置规则
export interface CardSetupRule {
  deck: CardDefinition[];
  handSize: number;
  dealingOrder: 'clockwise' | 'counterclockwise' | 'random';
}

// 卡牌定义
export interface CardDefinition {
  id: string;
  name: string;
  type: string;
  cost?: number;
  power?: number;
  toughness?: number;
  abilities?: string[];
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  count: number;
}

// 游戏流程规则
export interface GameplayRules {
  turnStructure: TurnStructure;
  phases: GamePhase[];
  validMoves: MoveValidation[];
  specialRules: SpecialRule[];
}

// 回合结构
export interface TurnStructure {
  order: 'clockwise' | 'counterclockwise' | 'bidding' | 'simultaneous';
  timeLimit?: number;
  skipConditions?: string[];
}

// 游戏阶段
export interface GamePhase {
  id: string;
  name: string;
  description: string;
  actions: string[];
  nextPhase?: string;
  skipConditions?: string[];
}

// 移动验证规则
export interface MoveValidation {
  actionType: string;
  conditions: ValidationCondition[];
  effects: ActionEffect[];
}

// 验证条件
export interface ValidationCondition {
  type: 'position' | 'resource' | 'state' | 'card' | 'custom';
  property: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'includes' | 'custom';
  value: any;
  customCheck?: string; // JavaScript表达式
}

// 动作效果
export interface ActionEffect {
  type: 'move' | 'modify' | 'add' | 'remove' | 'trigger';
  target: string;
  parameters: Record<string, any>;
}

// 特殊规则
export interface SpecialRule {
  id: string;
  name: string;
  description: string;
  trigger: TriggerCondition;
  effect: ActionEffect[];
}

// 触发条件
export interface TriggerCondition {
  event: string;
  conditions: ValidationCondition[];
}

// 计分规则
export interface ScoringRules {
  scoreType: 'points' | 'ranking' | 'elimination' | 'custom';
  scoreCalculation: ScoreCalculation[];
  bonuses: ScoreBonus[];
}

// 分数计算
export interface ScoreCalculation {
  source: string;
  formula: string;
  weight: number;
}

// 分数奖励
export interface ScoreBonus {
  condition: ValidationCondition[];
  bonus: number;
  description: string;
}

// 结束条件
export interface EndCondition {
  type: 'score' | 'time' | 'objective' | 'elimination' | 'custom';
  condition: ValidationCondition[];
  result: 'win' | 'lose' | 'continue';
}

// 游戏动作
export interface GameAction {
  id: string;
  name: string;
  description: string;
  type: 'move' | 'play_card' | 'draw_card' | 'attack' | 'defend' | 'custom';
  cost?: ActionCost[];
  requirements: ValidationCondition[];
  effects: ActionEffect[];
}

// 动作成本
export interface ActionCost {
  resource: string;
  amount: number;
}

// 游戏资源
export interface GameAssets {
  images: AssetDefinition[];
  sounds?: AssetDefinition[];
  fonts?: AssetDefinition[];
  animations?: AnimationDefinition[];
}

// 资源定义
export interface AssetDefinition {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: { width: number; height: number };
}

// 动画定义
export interface AnimationDefinition {
  id: string;
  name: string;
  frames: string[];
  duration: number;
  loop: boolean;
}

// 游戏元数据
export interface GameMetadata {
  author: string;
  created: string;
  lastModified: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string[];
  language: string;
  requires?: string[]; // 依赖的其他模板或扩展
}

// 游戏状态
export interface GameState {
  templateId: string;
  gameId: string;
  players: GamePlayer[];
  currentPlayer: string;
  currentPhase: string;
  turn: number;
  board?: BoardState;
  hands?: Record<string, any[]>;
  deck?: any[];
  discardPile?: any[];
  scores: Record<string, number>;
  gameData: Record<string, any>;
  history: GameAction[];
  startTime: number;
  isFinished: boolean;
  winner?: string[];
}

// 游戏玩家状态
export interface GamePlayer {
  id: string;
  name: string;
  avatar?: string;
  isConnected: boolean;
  resources: Record<string, number>;
  state: 'active' | 'inactive' | 'eliminated';
  lastAction?: number;
}

// 棋盘状态
export interface BoardState {
  size: { width: number; height: number };
  pieces: Record<string, PiecePosition>;
  tiles: Record<string, any>;
}

// 游戏模板引擎
export class GameTemplateEngine {
  private templates: Map<string, GameTemplate> = new Map();
  private activeGames: Map<string, GameState> = new Map();

  /**
   * 加载游戏模板
   */
  async loadTemplate(templateData: GameTemplate): Promise<void> {
    // 验证模板格式
    this.validateTemplate(templateData);
    
    this.templates.set(templateData.id, templateData);
    console.log(`游戏模板已加载: ${templateData.name}`);
  }

  /**
   * 从ZIP文件加载模板
   */
  async loadTemplateFromZip(zipFile: File): Promise<GameTemplate> {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipFile);
    
    // 查找template.json文件
    const templateFile = zip.file('template.json');
    if (!templateFile) {
      throw new Error('模板文件中缺少template.json');
    }

    const templateJson = await templateFile.async('text');
    const template: GameTemplate = JSON.parse(templateJson);

    // 加载资源文件
    await this.loadTemplateAssets(zip, template);

    // 加载并验证模板
    await this.loadTemplate(template);
    
    return template;
  }

  /**
   * 创建新游戏
   */
  createGame(templateId: string, gameId: string, players: Player[]): GameState {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`未找到模板: ${templateId}`);
    }

    if (players.length < template.minPlayers || players.length > template.maxPlayers) {
      throw new Error(`玩家数量不符合要求: ${template.minPlayers}-${template.maxPlayers}人`);
    }

    // 创建初始游戏状态
    const gameState: GameState = {
      templateId,
      gameId,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isConnected: true,
        resources: {},
        state: 'active'
      })),
      currentPlayer: players[0].id,
      currentPhase: template.rules.gameplay.phases[0]?.id || 'main',
      turn: 1,
      scores: {},
      gameData: {},
      history: [],
      startTime: Date.now(),
      isFinished: false
    };

    // 应用设置规则
    this.applySetupRules(gameState, template.rules.setup);

    this.activeGames.set(gameId, gameState);
    return gameState;
  }

  /**
   * 执行游戏动作
   */
  executeAction(gameId: string, playerId: string, action: GameAction, parameters: any): GameState {
    const gameState = this.activeGames.get(gameId);
    if (!gameState) {
      throw new Error(`未找到游戏: ${gameId}`);
    }

    const template = this.templates.get(gameState.templateId);
    if (!template) {
      throw new Error(`未找到模板: ${gameState.templateId}`);
    }

    // 验证动作是否有效
    if (!this.validateAction(gameState, template, playerId, action, parameters)) {
      throw new Error('无效的游戏动作');
    }

    // 应用动作效果
    this.applyActionEffects(gameState, action.effects, parameters);

    // 记录动作历史
    gameState.history.push({
      ...action,
      timestamp: Date.now(),
      playerId,
      parameters
    } as any);

    // 检查游戏结束条件
    this.checkEndConditions(gameState, template);

    return gameState;
  }

  /**
   * 获取游戏状态
   */
  getGameState(gameId: string): GameState | null {
    return this.activeGames.get(gameId) || null;
  }

  /**
   * 获取可用模板列表
   */
  getAvailableTemplates(): GameTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 验证模板格式
   */
  private validateTemplate(template: GameTemplate): void {
    if (!template.id || !template.name || !template.version) {
      throw new Error('模板缺少必需字段');
    }

    if (template.minPlayers < 1 || template.maxPlayers < template.minPlayers) {
      throw new Error('玩家数量设置无效');
    }

    // 其他验证逻辑...
  }

  /**
   * 加载模板资源
   */
  private async loadTemplateAssets(zip: any, template: GameTemplate): Promise<void> {
    // 加载图片资源
    for (const asset of template.assets.images) {
      const file = zip.file(asset.path);
      if (file) {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);
        // 将URL存储到某个地方，以便后续使用
        (asset as any).url = url;
      }
    }
  }

  /**
   * 应用设置规则
   */
  private applySetupRules(gameState: GameState, setupRules: SetupRules): void {
    // 应用初始状态
    Object.assign(gameState.gameData, setupRules.initialState);

    // 应用玩家设置
    for (const rule of setupRules.playerSetup) {
      gameState.players.forEach(player => {
        if (!player.resources[rule.property]) {
          player.resources[rule.property] = 0;
        }
        player.resources[rule.property] = rule.value;
      });
    }

    // 应用棋盘设置
    if (setupRules.boardSetup) {
      gameState.board = {
        size: setupRules.boardSetup.size,
        pieces: {},
        tiles: {}
      };

      setupRules.boardSetup.initialPieces.forEach(piece => {
        gameState.board!.pieces[piece.id] = piece;
      });
    }

    // 应用卡牌设置
    if (setupRules.cardSetup) {
      this.setupCards(gameState, setupRules.cardSetup);
    }
  }

  /**
   * 设置卡牌
   */
  private setupCards(gameState: GameState, cardSetup: CardSetupRule): void {
    // 构建牌组
    const deck: any[] = [];
    cardSetup.deck.forEach(cardDef => {
      for (let i = 0; i < cardDef.count; i++) {
        deck.push({ ...cardDef, instanceId: `${cardDef.id}_${i}` });
      }
    });

    // 洗牌
    this.shuffleDeck(deck);
    gameState.deck = deck;

    // 发牌
    gameState.hands = {};
    gameState.players.forEach(player => {
      gameState.hands![player.id] = [];
      for (let i = 0; i < cardSetup.handSize; i++) {
        const card = deck.pop();
        if (card) {
          gameState.hands![player.id].push(card);
        }
      }
    });
  }

  /**
   * 洗牌算法
   */
  private shuffleDeck(deck: any[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  /**
   * 验证动作
   */
  private validateAction(gameState: GameState, _template: GameTemplate, playerId: string, action: GameAction, parameters: any): boolean {
    // 检查是否轮到该玩家
    if (gameState.currentPlayer !== playerId) {
      return false;
    }

    // 检查动作要求
    return action.requirements.every(req => 
      this.evaluateCondition(gameState, req, playerId, parameters)
    );
  }

  /**
   * 评估条件
   */
  private evaluateCondition(_gameState: GameState, _condition: ValidationCondition, _playerId: string, _parameters: any): boolean {
    // 简化的条件评估逻辑
    // 实际实现中需要更复杂的表达式解析
    return true; // 占位符
  }

  /**
   * 应用动作效果
   */
  private applyActionEffects(gameState: GameState, effects: ActionEffect[], parameters: any): void {
    effects.forEach(effect => {
      switch (effect.type) {
        case 'move':
          this.applyMoveEffect(gameState, effect, parameters);
          break;
        case 'modify':
          this.applyModifyEffect(gameState, effect, parameters);
          break;
        // 其他效果类型...
      }
    });
  }

  /**
   * 应用移动效果
   */
  private applyMoveEffect(gameState: GameState, effect: ActionEffect, parameters: any): void {
    if (gameState.board && effect.target) {
      const piece = gameState.board.pieces[effect.target];
      if (piece && parameters.position) {
        piece.position = parameters.position;
      }
    }
  }

  /**
   * 应用修改效果
   */
  private applyModifyEffect(_gameState: GameState, _effect: ActionEffect, _parameters: any): void {
    // 修改游戏状态的逻辑
  }

  /**
   * 检查结束条件
   */
  private checkEndConditions(gameState: GameState, template: GameTemplate): void {
    for (const condition of template.rules.endConditions) {
      if (condition.condition.every(c => this.evaluateCondition(gameState, c, '', {}))) {
        gameState.isFinished = true;
        // 确定获胜者
        this.determineWinner(gameState, template);
        break;
      }
    }
  }

  /**
   * 确定获胜者
   */
  private determineWinner(gameState: GameState, template: GameTemplate): void {
    // 根据计分规则确定获胜者
    const scores = this.calculateFinalScores(gameState, template.rules.scoring);
    const maxScore = Math.max(...Object.values(scores));
    gameState.winner = Object.keys(scores).filter(playerId => scores[playerId] === maxScore);
  }

  /**
   * 计算最终分数
   */
  private calculateFinalScores(gameState: GameState, scoringRules: ScoringRules): Record<string, number> {
    const scores: Record<string, number> = {};
    
    gameState.players.forEach(player => {
      scores[player.id] = 0;
      
      scoringRules.scoreCalculation.forEach(calc => {
        // 简化的分数计算逻辑
        scores[player.id] += player.resources[calc.source] || 0;
      });
    });

    return scores;
  }
}

export default GameTemplateEngine; 