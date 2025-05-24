// 🤖 AI游戏助手服务

import { GameState, GameTemplate } from '../types/game';
import { Player } from '../types/common';
import { OllamaService } from './OllamaService';

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  gameContext?: {
    templateId: string;
    phase: string;
    suggestion?: string;
  };
}

export interface AIAssistantContext {
  gameTemplate?: GameTemplate;
  gameState?: GameState;
  currentPlayer: Player;
  chatHistory: AIMessage[];
}

export interface AIConfig {
  provider: 'local' | 'openai' | 'claude' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

export class AIAssistant {
  private context: AIAssistantContext;
  private isTyping: boolean = false;
  private ollamaService: OllamaService | null = null;
  private aiConfig: AIConfig;

  constructor(context: AIAssistantContext) {
    this.context = context;
    this.aiConfig = this.loadAIConfig();
    
    // 初始化Ollama服务
    if (this.aiConfig.provider === 'local') {
      const localConfig = this.loadLocalConfig();
      this.ollamaService = new OllamaService(`http://localhost:${localConfig.port || 11434}`);
    }
  }

  private loadAIConfig(): AIConfig {
    try {
      const saved = localStorage.getItem('aiConfig');
      return saved ? JSON.parse(saved) : {
        provider: 'local',
        enabled: true,
        temperature: 0.7,
        maxTokens: 2048
      };
    } catch {
      return {
        provider: 'local',
        enabled: true,
        temperature: 0.7,
        maxTokens: 2048
      };
    }
  }

  private loadLocalConfig() {
    try {
      const saved = localStorage.getItem('localAIConfig');
      return saved ? JSON.parse(saved) : {
        port: 11434,
        enabled: true,
        selectedModel: null
      };
    } catch {
      return {
        port: 11434,
        enabled: true,
        selectedModel: null
      };
    }
  }

  // === 主要聊天功能 ===

  public async sendMessage(userMessage: string): Promise<AIMessage> {
    this.isTyping = true;

    // 创建用户消息
    const userMsg: AIMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      gameContext: this.context.gameState ? {
        templateId: this.context.gameState.templateId,
        phase: this.context.gameState.phase
      } : undefined
    };

    // 添加到历史记录
    this.context.chatHistory.push(userMsg);

    // 生成AI回复
    const aiResponse = await this.generateAIResponse(userMessage);
    
    this.isTyping = false;
    this.context.chatHistory.push(aiResponse);
    
    return aiResponse;
  }

  private async generateAIResponse(userMessage: string): Promise<AIMessage> {
    if (!this.aiConfig.enabled) {
      return this.createErrorMessage('AI助手已禁用');
    }

    try {
      let response: string;

      if (this.aiConfig.provider === 'local' && this.ollamaService) {
        response = await this.generateOllamaResponse(userMessage);
      } else {
        // 回退到模拟响应
        response = await this.generateSimulatedResponse(userMessage);
      }

      return {
        id: `ai_${Date.now()}`,
        type: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        gameContext: this.context.gameState ? {
          templateId: this.context.gameState.templateId,
          phase: this.context.gameState.phase,
          suggestion: this.generateStrategySuggestion()
        } : undefined
      };
    } catch (error) {
      console.error('AI响应生成失败:', error);
      return this.createErrorMessage(`AI响应失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  private async generateOllamaResponse(userMessage: string): Promise<string> {
    if (!this.ollamaService) {
      throw new Error('Ollama服务未初始化');
    }

    const localConfig = this.loadLocalConfig();
    if (!localConfig.selectedModel) {
      throw new Error('未选择Ollama模型');
    }

    // 构建上下文感知的提示词
    const contextualPrompt = this.buildContextualPrompt(userMessage);

    const response = await this.ollamaService.generateResponse(
      localConfig.selectedModel,
      contextualPrompt,
      {
        temperature: this.aiConfig.temperature,
        max_tokens: this.aiConfig.maxTokens
      }
    );

    return response.response;
  }

  private buildContextualPrompt(userMessage: string): string {
    let prompt = `你是一个专业的桌面游戏助手，名字叫"游戏精灵"。你的任务是帮助玩家更好地理解和享受游戏。

玩家信息：
- 玩家名称：${this.context.currentPlayer.name}

`;

    if (this.context.gameTemplate) {
      prompt += `当前游戏：
- 游戏名称：${this.context.gameTemplate.name}
- 游戏规则：${this.context.gameTemplate.rules}

`;
    }

    if (this.context.gameState) {
      prompt += `游戏状态：
- 当前阶段：${this.getPhaseDescription(this.context.gameState.phase)}
- 回合数：第${this.context.gameState.round}回合
- 当前玩家：${this.context.gameState.players[this.context.gameState.currentPlayerIndex]?.name}

`;
    }

    prompt += `请根据以上信息回答玩家的问题。保持友好、专业的语调，提供准确有用的建议。

玩家问题：${userMessage}

请回答：`;

    return prompt;
  }

  private async generateSimulatedResponse(userMessage: string): Promise<string> {
    // 分析用户消息类型
    const messageType = this.analyzeMessageType(userMessage);
    
    let response: string;
    
    switch (messageType) {
      case 'game_rules':
        response = this.generateRulesResponse(userMessage);
        break;
      case 'strategy':
        response = this.generateStrategyResponse(userMessage);
        break;
      case 'game_state':
        response = this.generateGameStateResponse(userMessage);
        break;
      case 'general_help':
        response = this.generateGeneralHelpResponse(userMessage);
        break;
      default:
        response = this.generateDefaultResponse(userMessage);
    }

    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return response;
  }

  private createErrorMessage(errorText: string): AIMessage {
    return {
      id: `error_${Date.now()}`,
      type: 'system',
      content: `⚠️ ${errorText}`,
      timestamp: new Date().toISOString()
    };
  }

  // === 消息分析 ===

  private analyzeMessageType(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('规则') || lowerMessage.includes('怎么玩') || lowerMessage.includes('怎么下')) {
      return 'game_rules';
    }
    if (lowerMessage.includes('策略') || lowerMessage.includes('建议') || lowerMessage.includes('应该')) {
      return 'strategy';
    }
    if (lowerMessage.includes('当前') || lowerMessage.includes('现在') || lowerMessage.includes('状态')) {
      return 'game_state';
    }
    if (lowerMessage.includes('帮助') || lowerMessage.includes('功能')) {
      return 'general_help';
    }
    
    return 'general';
  }

  // === 不同类型的回复生成 ===

  private generateRulesResponse(_userMessage: string): string {
    if (!this.context.gameTemplate) {
      return "目前还没有选择游戏呢！请先选择一个游戏模板，我就能为你详细解释游戏规则了。🎮";
    }

    const template = this.context.gameTemplate;
    
    switch (template.id) {
      case 'gomoku':
        return `🎯 **五子棋规则说明**

这是一个经典的策略游戏：
• **目标**：率先在棋盘上连成5个棋子
• **棋盘**：15×15格子的棋盘
• **玩法**：轮流下棋，黑子先行
• **获胜**：横、竖、斜任意方向连成5子即获胜

**小贴士**：控制中心位置很重要哦！`;

      case 'card_compare':
        return `🃏 **比大小规则说明**

这是一个简单刺激的纸牌游戏：
• **目标**：率先赢得3局
• **玩法**：每轮每人抽一张牌比大小
• **大小**：A最大，2最小
• **花色**：黑桃>红心>方块>梅花
• **计分**：赢一局得1分，先到3分获胜

**策略**：观察已出的牌，判断剩余牌的概率！`;

      case 'dice_guess':
        return `🎲 **猜大小规则说明**

经典的骰子游戏：
• **目标**：保护好你的筹码
• **初始**：每人100筹码
• **下注**：猜测3个骰子总点数大小
• **大小**：大(11-18点) 小(3-10点)
• **回报**：猜中获得双倍奖金
• **结束**：5轮后或有人破产

**建议**：合理分配筹码，不要一次下注太多！`;

      default:
        return `这个游戏的规则是：${template.rules}

需要更详细的说明吗？我可以为你解释具体的玩法和策略！`;
    }
  }

  private generateStrategyResponse(_userMessage: string): string {
    if (!this.context.gameState) {
      return "游戏还没开始呢！开始游戏后我可以根据实际情况给你更精准的策略建议。✨";
    }

    const state = this.context.gameState;
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === this.context.currentPlayer.id;

    switch (state.templateId) {
      case 'gomoku':
        return this.generateGomokuStrategy(state, isMyTurn);
      case 'card_compare':
        return this.generateCardStrategy(state, isMyTurn);
      case 'dice_guess':
        return this.generateDiceStrategy(state, isMyTurn);
      default:
        return "我会根据游戏进程为你提供实时策略建议！";
    }
  }

  private generateGomokuStrategy(state: GameState, isMyTurn: boolean): string {
    const myPieces = state.board?.pieces.filter(p => p.playerId === this.context.currentPlayer.id) || [];
    
    if (myPieces.length === 0) {
      return `🎯 **五子棋策略建议**

由于你是${isMyTurn ? '先手' : '后手'}：
${isMyTurn ? 
  '• 建议在中心位置(7,7)附近下第一子\n• 控制棋盘中心，扩大影响范围' : 
  '• 观察对手布局，适时阻挡\n• 寻找机会建立自己的攻击线'
}

**通用策略**：
• 同时考虑进攻和防守
• 创建多个威胁点
• 注意对手的连子趋势`;
    }

    if (isMyTurn) {
      return `⚡ **当前回合建议**

• 检查是否有四连子可以获胜
• 查看对手是否有四连子需要阻挡
• 寻找能形成活三的位置
• 避免给对手创造优势

**记住**：攻守兼备是获胜关键！`;
    }

    return "观察对手的落子，思考他的意图。准备好你的反击策略！🤔";
  }

  private generateCardStrategy(state: GameState, isMyTurn: boolean): string {
    const currentPhase = state.phase;
    
    if (currentPhase === 'dealing') {
      return `🃏 **发牌阶段**

${isMyTurn ? '轮到你抽牌了！' : '等待其他玩家抽牌...'}

**策略提醒**：
• 记住已经出现的大牌
• 估算剩余牌堆的平均大小
• 为下一轮做心理准备`;
    }

    if (currentPhase === 'playing') {
      const myScore = state.players.find(p => p.id === this.context.currentPlayer.id)?.score || 0;
      return `🏆 **出牌策略**

当前你的分数：${myScore}/3

${isMyTurn ? 
  '• 如果你的牌很大，自信出牌\n• 如果牌一般，观察对手反应\n• 记住：只要不是最小的就有机会！' :
  '• 观察对手出牌的自信程度\n• 准备好应对策略'
}`;
    }

    return "保持专注，每一轮都很关键！";
  }

  private generateDiceStrategy(state: GameState, isMyTurn: boolean): string {
    const currentPhase = state.phase;
    const myChips = state.players.find(p => p.id === this.context.currentPlayer.id)?.score || 0;
    
    if (currentPhase === 'betting') {
      const roundNum = state.round;
      return `🎲 **下注策略**

第${roundNum}轮 | 你的筹码：${myChips}

**智能建议**：
• 前期：保守下注(10-20筹码)
• 中期：根据筹码情况调整
• 后期：可适当冒险

**概率参考**：
• 大(11-18)：约51.4%概率
• 小(3-10)：约48.6%概率
• 但要小心极值！`;
    }

    if (currentPhase === 'rolling') {
      return isMyTurn ? 
        "🎲 你是庄家！掷骰子决定大家的命运吧！" :
        "🤞 骰子将会决定你的命运...保持乐观的心态！";
    }

    return `💰 管理好你的${myChips}筹码，稳中求进！`;
  }

  private generateGameStateResponse(_userMessage: string): string {
    if (!this.context.gameState) {
      return "目前在房间大厅，还没有开始游戏。选择游戏模板后就可以开始了！";
    }

    const state = this.context.gameState;
    const currentPlayerName = state.players[state.currentPlayerIndex]?.name;
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === this.context.currentPlayer.id;

    return `📊 **当前游戏状态**

🎮 **游戏**：${this.getGameName(state.templateId)}
🔄 **阶段**：${this.getPhaseDescription(state.phase)}
🏆 **回合**：第${state.round}回合
👤 **当前玩家**：${currentPlayerName} ${isMyTurn ? '(你的回合)' : ''}

**玩家分数**：
${state.players.map(p => 
  `• ${p.name}: ${p.score}分 ${p.id === this.context.currentPlayer.id ? '(你)' : ''}`
).join('\n')}

${isMyTurn ? '轮到你了！需要策略建议吗？' : '等待对手行动中...'}`;
  }

  private generateGeneralHelpResponse(_userMessage: string): string {
    return `🤖 **AI助手功能说明**

我可以帮助你：

🎯 **游戏相关**
• 解释游戏规则和玩法
• 提供实时策略建议
• 分析当前游戏状态

💬 **聊天功能**
• 回答游戏相关问题
• 提供心理支持和鼓励
• 分享游戏技巧和心得

📝 **使用示例**
• "怎么玩五子棋？"
• "现在应该怎么下？"
• "当前游戏状态如何？"
• "给我一些策略建议"

随时问我任何问题，我很乐意帮助你！😊`;
  }

  private generateDefaultResponse(_userMessage: string): string {
    const responses = [
      "有趣的想法！关于游戏你还想了解什么吗？🤔",
      "我明白你的意思。需要我分析一下当前的游戏情况吗？📊",
      "好的！如果你有任何游戏相关的问题，随时问我！💡",
      "让我想想...你是想要策略建议还是规则解释呢？🎯",
      "不错的观察！我可以为你提供更深入的游戏分析。✨"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // === 辅助功能 ===

  private generateStrategySuggestion(): string {
    if (!this.context.gameState) return '';
    
    const suggestions = {
      'gomoku': ['观察对手连子', '控制中心区域', '创建多重威胁'],
      'card_compare': ['记住已出的牌', '估算胜率', '保持心态稳定'],
      'dice_guess': ['合理分配筹码', '注意概率变化', '适时冒险']
    };
    
    const gameSuggestions = suggestions[this.context.gameState.templateId as keyof typeof suggestions] || [];
    return gameSuggestions[Math.floor(Math.random() * gameSuggestions.length)];
  }

  private getGameName(templateId: string): string {
    const names: Record<string, string> = {
      'gomoku': '五子棋',
      'card_compare': '比大小',
      'dice_guess': '猜大小'
    };
    return names[templateId] || templateId;
  }

  private getPhaseDescription(phase: string): string {
    const descriptions: Record<string, string> = {
      'setup': '准备阶段',
      'dealing': '发牌阶段',
      'playing': '游戏进行中',
      'betting': '下注阶段',
      'rolling': '掷骰子',
      'revealing': '揭晓阶段',
      'scoring': '计分阶段',
      'finished': '游戏结束'
    };
    return descriptions[phase] || phase;
  }

  // === 公共方法 ===

  public updateContext(context: Partial<AIAssistantContext>): void {
    this.context = { ...this.context, ...context };
  }

  public getChatHistory(): AIMessage[] {
    return this.context.chatHistory;
  }

  public isAITyping(): boolean {
    return this.isTyping;
  }

  public clearHistory(): void {
    this.context.chatHistory = [];
  }

  public updateAIConfig(config: Partial<AIConfig>): void {
    this.aiConfig = { ...this.aiConfig, ...config };
    
    // 如果切换到本地AI，重新初始化Ollama服务
    if (config.provider === 'local') {
      const localConfig = this.loadLocalConfig();
      this.ollamaService = new OllamaService(`http://localhost:${localConfig.port || 11434}`);
    }
  }

  // === 智能提醒功能 ===

  public async generateSmartReminder(): Promise<AIMessage | null> {
    if (!this.context.gameState) return null;

    const state = this.context.gameState;
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === this.context.currentPlayer.id;
    
    if (!isMyTurn) return null;

    // 如果玩家超过30秒没有行动，发送提醒
    const lastActivity = new Date(state.lastActivity || state.startTime);
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();
    
    if (timeDiff > 30000) { // 30秒
      return {
        id: `reminder_${Date.now()}`,
        type: 'system',
        content: `⏰ 提醒：轮到你了！是否需要策略建议？当前是${this.getPhaseDescription(state.phase)}阶段。`,
        timestamp: new Date().toISOString(),
        gameContext: {
          templateId: state.templateId,
          phase: state.phase
        }
      };
    }

    return null;
  }
} 