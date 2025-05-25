# 🎲 桌游助手 (Tabletop Game Assistant)

一个现代化的Web桌游助手应用，支持动态游戏模板加载、AI对战和多人游戏体验。

## ✨ 主要特性

### 🎮 动态游戏模板系统
- **智能加载**: 支持动态加载和懒加载游戏模板
- **丰富模板**: 内置多种经典桌游（井字棋、五子棋、石头剪刀布等）
- **模板管理**: 完整的模板浏览、搜索、过滤和详情查看
- **可扩展性**: 易于添加新的游戏模板

### 🤖 AI对战支持
- **多难度AI**: 从入门到专家级别的AI对手
- **智能策略**: 针对不同游戏的专用AI算法
- **行为模式**: 保守、平衡、激进等不同AI性格

### 🎨 现代化界面
- **响应式设计**: 完美适配桌面、平板和移动设备
- **4K优化**: 针对高分辨率显示器的特别优化
- **动画效果**: 流畅的过渡动画和交互反馈
- **主题系统**: 统一的设计语言和视觉风格

### 👥 多人游戏支持
- **本地多人**: 支持2-8人同时游戏
- **玩家管理**: 完整的玩家信息配置系统
- **实时游戏**: 流畅的实时游戏体验

## 🎯 内置游戏

### 策略游戏
- **井字棋** ⭕: 经典3×3棋盘游戏，支持AI对战
- **五子棋** ♟️: 15×15棋盘，率先连成五子获胜

### 派对游戏
- **石头剪刀布** ✂️: 支持多人同时游戏，三局两胜制

### 纸牌游戏
- **比大小** 🃏: 简单有趣的纸牌比较游戏

### 骰子游戏
- **猜大小** 🎲: 经典的骰子博弈游戏，支持筹码系统

## 🚀 快速开始

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装运行

1. **克隆项目**
```bash
git clone https://github.com/your-username/tabletop-game-assistant.git
cd tabletop-game-assistant
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问 `http://localhost:3001`

### 构建部署

```bash
# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── pages/          # 页面组件
│   │   ├── HomePage.tsx           # 首页
│   │   ├── TemplateManagePage.tsx # 模板管理
│   │   ├── PlayerSetupPage.tsx    # 玩家设置
│   │   ├── AISettingsPage.tsx     # AI设置
│   │   └── GameRoomPage.tsx       # 游戏房间
│   └── game/           # 游戏相关组件
├── services/           # 服务层
│   └── DynamicGameLoader.ts      # 动态游戏加载器
├── games/              # 游戏实现
│   ├── TicTacToeGame.ts          # 井字棋
│   ├── RockPaperScissorsGame.ts  # 石头剪刀布
│   └── ...
├── types/              # TypeScript类型定义
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## 🎮 游戏开发

### 添加新游戏模板

1. **创建游戏文件**
在 `src/games/` 目录下创建新的游戏实现：

```typescript
// YourGame.ts
export class YourGameRules implements GameRules {
  validateAction(state: GameState, action: GameAction): boolean {
    // 验证游戏动作
  }
  
  executeAction(state: GameState, action: GameAction): GameState {
    // 执行游戏动作
  }
  
  checkWinCondition(state: GameState): WinResult | null {
    // 检查胜利条件
  }
  
  // ... 其他必需方法
}

export function createYourGame() {
  return {
    rules: new YourGameRules(),
    initialState: { /* 初始状态 */ }
  };
}
```

2. **注册模板**
在 `DynamicGameLoader.ts` 中添加模板定义：

```typescript
{
  id: 'yourGame',
  name: '你的游戏',
  description: '游戏描述',
  category: 'strategy',
  // ... 其他属性
  createGame: async () => {
    const { createYourGame } = await import('../games/YourGame');
    return createYourGame();
  }
}
```

## 📚 文档

- [🎮 动态游戏模板系统文档](docs/dynamic-game-system.md)
- [📚 用户使用指南](docs/user-guide.md)
- [🔧 开发者指南](docs/developer-guide.md)

## 🛠 技术栈

### 前端技术
- **React 18**: 用户界面框架
- **TypeScript**: 类型安全的JavaScript
- **Vite**: 现代化构建工具
- **CSS Modules**: 模块化样式系统

### 游戏引擎
- **自研轻量级引擎**: 专为桌游优化的游戏状态管理
- **模块化设计**: 易于扩展和维护
- **AI系统**: 支持多种AI算法和策略

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Hot Reload**: 开发时热更新

## 🔄 更新日志

### v2.0.0 (2024-12-01)
- ✨ 全新动态游戏模板系统
- 🎨 现代化界面重构
- 🤖 增强的AI对战功能
- 📱 完善的响应式设计
- 🎮 新增石头剪刀布游戏
- 🔧 优化构建和部署流程

### v1.0.0 (2024-01-01)
- 🎉 项目初始版本
- 🎮 基础游戏模板支持
- 👥 多人游戏功能
- 🎨 基础界面设计

## 🤝 贡献指南

我们欢迎各种形式的贡献！

### 如何贡献
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 贡献类型
- 🐛 Bug修复
- ✨ 新功能开发
- 📚 文档改进
- 🎨 界面优化
- 🎮 新游戏模板
- 🔧 性能优化

## 📞 支持与反馈

- **GitHub Issues**: [提交bug报告或功能请求](https://github.com/your-username/tabletop-game-assistant/issues)
- **邮箱支持**: support@tabletop-assistant.com
- **在线文档**: [查看详细文档](https://docs.tabletop-assistant.com)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

- React 团队提供的优秀前端框架
- Vite 团队提供的现代化构建工具
- 所有提供反馈和建议的用户

## 🚀 未来计划

### 短期目标 (3个月内)
- [ ] 添加更多经典桌游模板
- [ ] 优化AI算法性能
- [ ] 完善移动端体验
- [ ] 增加游戏统计功能

### 中期目标 (6个月内)
- [ ] 支持自定义模板导入
- [ ] 添加在线多人游戏
- [ ] 开发模板编辑器
- [ ] 增加社区分享功能

### 长期目标 (1年内)
- [ ] 构建游戏模板商店
- [ ] 支持AR/VR游戏体验
- [ ] 机器学习增强AI
- [ ] 国际化多语言支持

---

**让桌游更有趣，让科技更贴心！** 🎲❤️ 