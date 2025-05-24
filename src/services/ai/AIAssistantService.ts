import { GameTemplate, GameState, GameAction } from '../gameTemplate/GameTemplateEngine';
import { Player } from '../../types/common';

// AI查询类型
export type QueryType = 'rules' | 'strategy' | 'scoring' | 'actions' | 'general';

// AI响应结果
export interface AIResponse {
  type: QueryType;
  query: string;
  response: string;
  confidence: number;
  suggestedActions?: string[];
  relatedRules?: string[];
  examples?: string[];
}

// 游戏提示类型
export interface GameHint {
  type: 'warning' | 'suggestion' | 'rule_reminder' | 'strategy_tip';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  context?: {
    gamePhase?: string;
    playerAction?: string;
    gameState?: any;
  };
}

// AI助手配置
export interface AIAssistantConfig {
  enableRuleQuery: boolean;
  enableGameHints: boolean;
  enableStrategyTips: boolean;
  hintFrequency: 'low' | 'medium' | 'high';
  language: 'zh-CN' | 'en-US';
}

export class AIAssistantService {
  private config: AIAssistantConfig;
  private gameKnowledge: Map<string, any> = new Map();
  private conversationHistory: Array<{ query: string; response: string; timestamp: number }> = [];

  constructor(config: Partial<AIAssistantConfig> = {}) {
    this.config = {
      enableRuleQuery: true,
      enableGameHints: true,
      enableStrategyTips: false,
      hintFrequency: 'medium',
      language: 'zh-CN',
      ...config
    };
  }

  /**
   * 查询游戏规则
   */
  async queryRules(query: string, gameTemplate?: GameTemplate, gameState?: GameState): Promise<AIResponse> {
    // 解析查询意图
    const queryType = this.parseQueryType(query);
    
    // 根据查询类型处理
    let response: string;
    let suggestedActions: string[] = [];
    let relatedRules: string[] = [];
    
    switch (queryType) {
      case 'rules':
        response = await this.handleRulesQuery(query, gameTemplate);
        relatedRules = this.findRelatedRules(query, gameTemplate);
        break;
      case 'actions':
        response = await this.handleActionsQuery(query, gameTemplate, gameState);
        suggestedActions = this.getAvailableActions(gameState, gameTemplate);
        break;
      case 'scoring':
        response = await this.handleScoringQuery(query, gameTemplate);
        break;
      case 'strategy':
        response = await this.handleStrategyQuery(query, gameTemplate, gameState);
        break;
      default:
        response = await this.handleGeneralQuery(query);
    }

    const aiResponse: AIResponse = {
      type: queryType,
      query,
      response,
      confidence: this.calculateConfidence(query, response),
      suggestedActions,
      relatedRules
    };

    // 记录对话历史
    this.conversationHistory.push({
      query,
      response,
      timestamp: Date.now()
    });

    return aiResponse;
  }

  /**
   * 获取游戏提示
   */
  async getGameHints(gameState: GameState, gameTemplate: GameTemplate, currentPlayer: Player): Promise<GameHint[]> {
    if (!this.config.enableGameHints) {
      return [];
    }

    const hints: GameHint[] = [];

    // 检查规则提醒
    const ruleHints = this.checkRuleReminders(gameState, gameTemplate);
    hints.push(...ruleHints);

    // 检查策略建议
    if (this.config.enableStrategyTips) {
      const strategyHints = this.generateStrategyHints(gameState, gameTemplate, currentPlayer);
      hints.push(...strategyHints);
    }

    // 检查警告信息
    const warningHints = this.checkWarnings(gameState, gameTemplate);
    hints.push(...warningHints);

    return hints.slice(0, this.getMaxHints());
  }

  /**
   * 分析游戏行为并提供反馈
   */
  async analyzePlayerAction(action: GameAction, gameState: GameState, gameTemplate: GameTemplate, playerId: string): Promise<GameHint[]> {
    const hints: GameHint[] = [];

    // 检查动作合法性
    if (!this.isActionLegal(action, gameState, gameTemplate, playerId)) {
      hints.push({
        type: 'warning',
        title: '非法动作',
        message: '此动作不符合当前游戏规则，请检查游戏状态和动作要求。',
        priority: 'high',
        context: {
          playerAction: action.name,
          gamePhase: gameState.currentPhase
        }
      });
    }

    // 检查策略建议
    const strategicAnalysis = this.analyzeActionStrategy(action, gameState, gameTemplate);
    if (strategicAnalysis) {
      hints.push(strategicAnalysis);
    }

    return hints;
  }

  /**
   * 更新游戏知识库
   */
  updateGameKnowledge(gameTemplate: GameTemplate): void {
    const knowledgeBase = {
      rules: this.extractRulesKnowledge(gameTemplate),
      actions: this.extractActionsKnowledge(gameTemplate),
      scoring: this.extractScoringKnowledge(gameTemplate),
      strategy: this.generateStrategyKnowledge(gameTemplate)
    };

    this.gameKnowledge.set(gameTemplate.id, knowledgeBase);
  }

  /**
   * 解析查询类型
   */
  private parseQueryType(query: string): QueryType {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('规则') || lowerQuery.includes('怎么') || lowerQuery.includes('如何')) {
      return 'rules';
    }
    if (lowerQuery.includes('动作') || lowerQuery.includes('操作') || lowerQuery.includes('可以做')) {
      return 'actions';
    }
    if (lowerQuery.includes('分数') || lowerQuery.includes('得分') || lowerQuery.includes('计分')) {
      return 'scoring';
    }
    if (lowerQuery.includes('策略') || lowerQuery.includes('建议') || lowerQuery.includes('技巧')) {
      return 'strategy';
    }
    
    return 'general';
  }

  /**
   * 处理规则查询
   */
  private async handleRulesQuery(query: string, gameTemplate?: GameTemplate): Promise<string> {
    if (!gameTemplate) {
      return '请先选择一个游戏模板，我就能为您详细解答相关规则了。';
    }

    const knowledge = this.gameKnowledge.get(gameTemplate.id);
    if (!knowledge) {
      return `关于 ${gameTemplate.name} 的详细规则信息正在整理中。您可以查看游戏描述：${gameTemplate.description}`;
    }

    // 基于关键词匹配规则
    const relevantRules = this.findRelevantRules(query, knowledge.rules);
    
    if (relevantRules.length > 0) {
      return `关于您的问题，相关规则如下：\n\n${relevantRules.join('\n\n')}`;
    }

    return `我理解您想了解 ${gameTemplate.name} 的规则。这是一个 ${gameTemplate.type} 类型的游戏，适合 ${gameTemplate.minPlayers}-${gameTemplate.maxPlayers} 人游戏，预计用时 ${gameTemplate.estimatedDuration} 分钟。您能更具体地描述想了解哪方面的规则吗？`;
  }

  /**
   * 处理动作查询
   */
  private async handleActionsQuery(_query: string, gameTemplate?: GameTemplate, gameState?: GameState): Promise<string> {
    if (!gameTemplate || !gameState) {
      return '请在游戏中询问可执行的动作，我会根据当前游戏状态为您分析。';
    }

    const availableActions = this.getAvailableActions(gameState, gameTemplate);
    
    if (availableActions.length === 0) {
      return '当前没有可执行的动作，请等待其他玩家完成操作或检查游戏状态。';
    }

    return `在当前游戏阶段（${gameState.currentPhase}），您可以执行以下动作：\n\n${availableActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}`;
  }

  /**
   * 处理计分查询
   */
  private async handleScoringQuery(_query: string, gameTemplate?: GameTemplate): Promise<string> {
    if (!gameTemplate) {
      return '请选择一个游戏模板，我就能详细解释该游戏的计分规则。';
    }

    const scoring = gameTemplate.rules.scoring;
    
    let response = `${gameTemplate.name} 的计分方式：\n\n`;
    response += `计分类型：${this.translateScoreType(scoring.scoreType)}\n\n`;
    
    if (scoring.scoreCalculation.length > 0) {
      response += '分数计算规则：\n';
      scoring.scoreCalculation.forEach((calc, index) => {
        response += `${index + 1}. ${calc.source}：${calc.formula} (权重: ${calc.weight})\n`;
      });
    }

    if (scoring.bonuses.length > 0) {
      response += '\n奖励分数：\n';
      scoring.bonuses.forEach((bonus, index) => {
        response += `${index + 1}. ${bonus.description}：+${bonus.bonus}分\n`;
      });
    }

    return response;
  }

  /**
   * 处理策略查询
   */
  private async handleStrategyQuery(_query: string, gameTemplate?: GameTemplate, gameState?: GameState): Promise<string> {
    if (!this.config.enableStrategyTips) {
      return '策略提示功能当前已关闭。您可以在设置中开启此功能。';
    }

    if (!gameTemplate) {
      return '请在具体游戏中询问策略建议，我会根据游戏规则和当前状况为您分析。';
    }

    // 基于游戏类型提供通用策略建议
    const strategies = this.getGameStrategies(gameTemplate);
    
    let response = `关于 ${gameTemplate.name} 的策略建议：\n\n`;
    strategies.forEach((strategy, index) => {
      response += `${index + 1}. ${strategy}\n\n`;
    });

    if (gameState) {
      const contextualTip = this.getContextualStrategyTip(gameState, gameTemplate);
      if (contextualTip) {
        response += `\n当前情况下的特别建议：${contextualTip}`;
      }
    }

    return response;
  }

  /**
   * 处理一般查询
   */
  private async handleGeneralQuery(_query: string): Promise<string> {
    const responses = [
      '我是您的桌游AI助手，可以帮助您了解游戏规则、分析策略、查询可用动作等。请告诉我您想了解什么？',
      '您好！我能为您解答游戏规则、提供策略建议、分析游戏状态等。请具体描述您的问题。',
      '我可以协助您更好地理解和享受桌游体验。您可以询问规则、策略、计分方式等任何游戏相关问题。'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 计算响应置信度
   */
  private calculateConfidence(_query: string, response: string): number {
    // 简单的置信度计算
    const responseLength = response.length;
    
    let confidence = 0.5; // 基础置信度
    
    // 响应长度适中加分
    if (responseLength > 50 && responseLength < 500) {
      confidence += 0.2;
    }
    
    // 包含具体信息加分
    if (response.includes('规则') || response.includes('动作') || response.includes('分数')) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 0.95);
  }

  /**
   * 检查规则提醒
   */
  private checkRuleReminders(gameState: GameState, gameTemplate: GameTemplate): GameHint[] {
    const hints: GameHint[] = [];
    
    // 检查回合时间限制
    if (gameTemplate.rules.gameplay.turnStructure.timeLimit) {
      hints.push({
        type: 'rule_reminder',
        title: '回合时间提醒',
        message: `请注意：每回合限时 ${gameTemplate.rules.gameplay.turnStructure.timeLimit} 秒`,
        priority: 'medium'
      });
    }

    // 检查特殊阶段规则
    const currentPhase = gameTemplate.rules.gameplay.phases.find(p => p.id === gameState.currentPhase);
    if (currentPhase && currentPhase.actions.length > 0) {
      hints.push({
        type: 'rule_reminder',
        title: '当前阶段',
        message: `在 ${currentPhase.name} 阶段，您可以：${currentPhase.actions.join('、')}`,
        priority: 'low'
      });
    }

    return hints;
  }

  /**
   * 生成策略提示
   */
  private generateStrategyHints(gameState: GameState, _gameTemplate: GameTemplate, _currentPlayer: Player): GameHint[] {
    const hints: GameHint[] = [];
    
    // 基于游戏进度提供策略建议
    const gameProgress = gameState.turn / 10; // 假设10回合为一个游戏
    
    if (gameProgress < 0.3) {
      hints.push({
        type: 'strategy_tip',
        title: '游戏初期建议',
        message: '游戏刚开始，建议先了解其他玩家的策略倾向，稳健发展。',
        priority: 'low'
      });
    } else if (gameProgress > 0.7) {
      hints.push({
        type: 'strategy_tip',
        title: '游戏后期建议',
        message: '游戏接近尾声，是时候考虑冲刺或阻止其他玩家获胜了。',
        priority: 'medium'
      });
    }

    return hints;
  }

  /**
   * 检查警告信息
   */
  private checkWarnings(gameState: GameState, gameTemplate: GameTemplate): GameHint[] {
    const hints: GameHint[] = [];
    
    // 检查游戏结束条件
    for (const endCondition of gameTemplate.rules.endConditions) {
      if (endCondition.type === 'score') {
        const currentScore = gameState.scores[gameState.currentPlayer] || 0;
        if (currentScore < 0) {
          hints.push({
            type: 'warning',
            title: '分数警告',
            message: '您的分数为负数，请调整策略避免进一步损失。',
            priority: 'high'
          });
        }
      }
    }

    return hints;
  }

  /**
   * 获取最大提示数量
   */
  private getMaxHints(): number {
    switch (this.config.hintFrequency) {
      case 'low': return 1;
      case 'medium': return 3;
      case 'high': return 5;
      default: return 3;
    }
  }

  // 辅助方法
  private isActionLegal(_action: GameAction, gameState: GameState, _gameTemplate: GameTemplate, playerId: string): boolean {
    // 简化的合法性检查
    return gameState.currentPlayer === playerId;
  }

  private analyzeActionStrategy(_action: GameAction, _gameState: GameState, _gameTemplate: GameTemplate): GameHint | null {
    // 简化的策略分析
    return null;
  }

  private extractRulesKnowledge(gameTemplate: GameTemplate): string[] {
    return [
      `游戏人数：${gameTemplate.minPlayers}-${gameTemplate.maxPlayers}人`,
      `游戏时长：约${gameTemplate.estimatedDuration}分钟`,
      `游戏类型：${gameTemplate.type}`
    ];
  }

  private extractActionsKnowledge(gameTemplate: GameTemplate): string[] {
    return gameTemplate.rules.actions.map(action => `${action.name}: ${action.description}`);
  }

  private extractScoringKnowledge(gameTemplate: GameTemplate): string[] {
    return gameTemplate.rules.scoring.scoreCalculation.map(calc => 
      `${calc.source}: ${calc.formula}`
    );
  }

  private generateStrategyKnowledge(gameTemplate: GameTemplate): string[] {
    // 基于游戏类型生成策略知识
    const strategies: string[] = [];
    
    switch (gameTemplate.type) {
      case 'card':
        strategies.push('观察其他玩家的出牌模式');
        strategies.push('合理管理手牌资源');
        break;
      case 'board':
        strategies.push('控制关键位置');
        strategies.push('平衡进攻与防守');
        break;
    }
    
    return strategies;
  }

  private findRelevantRules(query: string, rules: string[]): string[] {
    return rules.filter(rule => 
      rule.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().split(' ').some(word => rule.toLowerCase().includes(word))
    );
  }

  private findRelatedRules(query: string, gameTemplate?: GameTemplate): string[] {
    if (!gameTemplate) return [];
    
    // 简化的相关规则查找
    return gameTemplate.rules.actions
      .filter(action => action.name.toLowerCase().includes(query.toLowerCase()))
      .map(action => action.description);
  }

  private getAvailableActions(gameState?: GameState, gameTemplate?: GameTemplate): string[] {
    if (!gameState || !gameTemplate) return [];
    
    const currentPhase = gameTemplate.rules.gameplay.phases.find(p => p.id === gameState.currentPhase);
    return currentPhase ? currentPhase.actions : [];
  }

  private translateScoreType(scoreType: string): string {
    const translations: Record<string, string> = {
      'points': '积分制',
      'ranking': '排名制',
      'elimination': '淘汰制',
      'custom': '自定义'
    };
    return translations[scoreType] || scoreType;
  }

  private getGameStrategies(gameTemplate: GameTemplate): string[] {
    const knowledge = this.gameKnowledge.get(gameTemplate.id);
    return knowledge?.strategy || ['暂无特定策略建议，请根据游戏规则灵活应对'];
  }

  private getContextualStrategyTip(gameState: GameState, _gameTemplate: GameTemplate): string | null {
    // 基于当前游戏状态的策略建议
    const currentScore = gameState.scores[gameState.currentPlayer] || 0;
    const averageScore = Object.values(gameState.scores).reduce((a, b) => a + b, 0) / Object.keys(gameState.scores).length;
    
    if (currentScore < averageScore) {
      return '您当前分数较低，考虑采用更积极的策略追赶';
    } else if (currentScore > averageScore * 1.5) {
      return '您目前领先，可以考虑稳健策略保持优势';
    }
    
    return null;
  }
}

export default AIAssistantService; 