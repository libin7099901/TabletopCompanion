# 🎮 动态游戏模板系统文档

## 概述

动态游戏模板系统是桌游助手的核心功能，它允许动态加载、管理和创建各种桌游模板。该系统采用模块化设计，支持懒加载、缓存、过滤搜索等高级功能。

## 系统架构

### 1. 核心组件

#### DynamicGameLoader (`src/services/DynamicGameLoader.ts`)
- **功能**: 模板加载器，负责动态加载游戏模板
- **特性**:
  - 模板预加载和懒加载
  - 内存缓存机制
  - 依赖管理
  - 批量加载支持
  - 错误处理和回退机制

#### ExtendedGameTemplate 接口
扩展的游戏模板接口，包含丰富的元数据：

```typescript
interface ExtendedGameTemplate {
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
  estimatedTime: number;
  setupTime?: number;
  difficulty: 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';
  complexity: number; // 1-10
  
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
  
  // 游戏工厂函数
  createGame: () => Promise<{
    rules: GameRules;
    initialState: Partial<GameState>;
    ui?: GameUIConfig;
  }>;
  
  // 更多属性...
}
```

### 2. 内置游戏模板

系统目前包含以下内置游戏模板：

#### 五子棋 (gomoku)
- **分类**: 策略游戏
- **玩家**: 2人
- **难度**: 中等
- **特性**: AI支持、观战模式、回放系统

#### 井字棋 (ticTacToe)
- **分类**: 策略游戏  
- **玩家**: 2人
- **难度**: 入门
- **特性**: AI支持、快速游戏
- **实现**: `src/games/TicTacToeGame.ts`

#### 石头剪刀布 (rockPaperScissors)
- **分类**: 派对游戏
- **玩家**: 2-8人
- **难度**: 入门
- **特性**: 多人支持、实时游戏、AI模式识别
- **实现**: `src/games/RockPaperScissorsGame.ts`

#### 比大小 (cardCompare)
- **分类**: 纸牌游戏
- **玩家**: 2-4人
- **难度**: 简单
- **特性**: 纸牌系统、得分机制

#### 猜大小 (diceGuess)
- **分类**: 骰子游戏
- **玩家**: 2-6人
- **难度**: 简单
- **特性**: 筹码系统、博弈机制

## 模板管理页面

### 功能特性

#### 1. 搜索与过滤
- **全文搜索**: 支持在模板名称、描述、标签中搜索
- **分类过滤**: 按游戏类型（策略、派对、纸牌、骰子等）过滤
- **难度过滤**: 按难度等级过滤

#### 2. 排序功能
- 按名称排序
- 按评分排序  
- 按下载量排序
- 按更新时间排序
- 按难度排序
- 支持升序/降序切换

#### 3. 视图模式
- **网格视图**: 卡片式布局，显示完整信息
- **列表视图**: 紧凑列表，快速浏览

#### 4. 详情面板
- 完整的游戏规则说明
- 游戏信息（玩家数、时长、难度）
- 功能特性展示
- 游戏组件列表
- 一键开始游戏

### 使用方法

1. **浏览模板**: 在左侧列表中查看所有可用模板
2. **搜索过滤**: 使用搜索框或过滤器快速找到目标模板
3. **查看详情**: 点击模板卡片查看详细信息
4. **开始游戏**: 点击"开始游戏"按钮启动模板

## 游戏规则实现

### 井字棋游戏规则

#### TicTacToeRules 类
实现了 `GameRules` 接口，包含：

- **动作验证**: 检查位置有效性和占用状态
- **动作执行**: 处理棋子放置逻辑
- **胜利检测**: 检查横、竖、斜三个方向的连线
- **AI支持**: Minimax算法实现

#### 游戏状态管理
- 3×3棋盘状态
- 棋子位置管理
- 历史记录追踪
- 胜负判定

### 石头剪刀布游戏规则

#### RPSGameState 接口
扩展了基础游戏状态：

```typescript
interface RPSGameState extends GameState {
  currentRound: number;
  maxRounds: number;
  choices: Record<string, RPSChoice>;
  roundHistory: Array<{
    round: number;
    choices: Record<string, RPSChoice>;
    results: Record<string, 'win' | 'lose' | 'draw'>;
    winner?: string;
  }>;
}
```

#### 游戏逻辑
- **同时选择**: 所有玩家同时做出选择
- **结果计算**: 支持2人对战和多人混战
- **三局两胜**: 先达到获胜阈值者胜利
- **AI策略**: 模式识别和难度调节

## API 参考

### DynamicGameLoader 方法

#### 模板加载
```typescript
// 加载单个模板
async loadTemplate(templateId: string): Promise<ExtendedGameTemplate>

// 批量加载
async loadMultiple(templateIds: string[]): Promise<ExtendedGameTemplate[]>

// 预加载所有模板
async preloadAll(): Promise<void>
```

#### 模板查询
```typescript
// 获取模板
getTemplate(templateId: string): ExtendedGameTemplate | undefined

// 获取所有模板
getAllTemplates(): ExtendedGameTemplate[]

// 按分类查询
getTemplatesByCategory(category: string): ExtendedGameTemplate[]

// 按标签查询
getTemplatesByTags(tags: string[]): ExtendedGameTemplate[]

// 搜索模板
searchTemplates(query: string): ExtendedGameTemplate[]
```

#### 游戏实例创建
```typescript
// 创建游戏实例
async createGameInstance(templateId: string): Promise<{
  rules: GameRules;
  initialState: Partial<GameState>;
  ui?: GameUIConfig;
}>
```

## 开发指南

### 添加新游戏模板

1. **创建游戏文件**: 在 `src/games/` 目录下创建新的游戏实现
2. **实现 GameRules**: 继承并实现 `GameRules` 接口
3. **定义游戏状态**: 扩展 `GameState` 接口（如需要）
4. **注册模板**: 在 `DynamicGameLoader` 中添加模板定义
5. **测试验证**: 确保游戏逻辑正确运行

### 模板文件结构
```typescript
// 游戏规则类
export class YourGameRules implements GameRules {
  validateAction(state: GameState, action: GameAction): boolean
  executeAction(state: GameState, action: GameAction): GameState
  checkWinCondition(state: GameState): WinResult | null
  getValidActions(state: GameState, playerId: string): ActionType[]
  // ...
}

// 游戏创建函数
export function createYourGame() {
  return {
    rules: new YourGameRules(),
    initialState: { /* 初始状态 */ }
  };
}

// AI实现（可选）
export class YourGameAI {
  getBestMove(state: GameState, playerId: string): Move
  // ...
}
```

## 性能优化

### 加载优化
- **懒加载**: 仅在需要时加载模板代码
- **预加载**: 提前加载常用模板
- **缓存机制**: 避免重复加载

### 内存管理
- **模板缓存**: 智能缓存已加载模板
- **垃圾回收**: 及时清理未使用资源
- **批量操作**: 支持批量加载以提高效率

## 故障排除

### 常见问题

1. **模板加载失败**
   - 检查模板ID是否正确
   - 确认模板文件是否存在
   - 查看控制台错误信息

2. **游戏规则错误**
   - 验证GameRules接口实现
   - 检查动作验证逻辑
   - 确认状态更新机制

3. **性能问题**
   - 启用模板缓存
   - 减少不必要的重新加载
   - 使用预加载优化首次访问

## 未来计划

### 短期目标
- [ ] 添加更多内置游戏模板
- [ ] 优化模板加载性能
- [ ] 完善错误处理机制

### 长期目标
- [ ] 支持自定义模板导入
- [ ] 在线模板商店
- [ ] 模板评分和评论系统
- [ ] 社区分享功能

## 技术栈

- **前端框架**: React + TypeScript
- **状态管理**: React Hooks
- **样式系统**: CSS Modules + 设计系统
- **构建工具**: Vite
- **游戏引擎**: 自研轻量级引擎

## 贡献指南

欢迎提交新的游戏模板！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支
3. 实现游戏模板
4. 添加测试用例
5. 提交 Pull Request

---

*最后更新: 2024年12月* 