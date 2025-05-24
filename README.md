# 🎮 桌游伴侣 (TabletopCompanion)

一个现代化的桌游助手应用，支持多人在线游戏、AI对手、游戏模板管理等功能。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)
![Vite](https://img.shields.io/badge/vite-5.4-green.svg)

## ✨ 功能特性

### 🎯 核心功能
- **多人房间系统** - 创建或加入游戏房间，支持最多8人同时游戏
- **游戏模板管理** - 内置多种经典游戏模板（德州扑克、国际象棋、骰子游戏等）
- **模板切换功能** - 房主可随时切换游戏模板，支持灵活的游戏体验
- **演示模式** - 单人练习模式，配备AI助手
- **实时同步** - 房间状态实时更新，玩家操作即时反馈

### 🎨 用户体验
- **现代化UI** - 采用最新设计规范，支持深色/浅色主题
- **响应式设计** - 完美适配桌面、平板、手机三端
- **无障碍支持** - 支持屏幕阅读器、键盘导航、高对比度模式
- **性能优化** - 页面加载 < 2秒，操作响应 < 500ms

### 🛠️ 技术特性
- **端到端测试** - 完整的Cypress自动化测试覆盖
- **类型安全** - 100% TypeScript编写，编译时类型检查
- **模块化架构** - 可扩展的组件系统和状态管理
- **本地持久化** - 玩家数据和房间状态本地存储

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/libin7099901/TabletopCompanion.git
cd TabletopCompanion

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📱 使用指南

### 1. 设置玩家信息
- 首次进入时，点击右上角设置玩家昵称
- 系统会自动生成玩家ID并保存到本地

### 2. 创建游戏房间
```bash
开始游戏 → 创建房间 → 设置房间参数 → 邀请好友
```
- 支持2-8人房间
- 可设置房间密码
- 自动生成分享用的房间ID

### 3. 选择游戏模板
- 房主可在房间内选择游戏模板
- 支持实时切换不同游戏
- 内置多种经典游戏模板

### 4. 开始游戏
- 达到最低人数要求后即可开始
- 支持暂停和重新开始
- 游戏状态实时同步

## 🎮 游戏模板

### 🃏 卡牌游戏
- **德州扑克** - 2-8人，30分钟，中等难度
- 经典的扑克游戏，考验心理战术和运气

### ♟️ 棋类游戏  
- **国际象棋** - 2人，45分钟，困难
- 策略性棋类游戏，锻炼逻辑思维

### 🎲 骰子游戏
- **骰子游戏** - 2-6人，15分钟，简单
- 简单有趣的骰子游戏，适合快速游戏

## 🏗️ 项目结构

```
src/
├── components/          # 可复用组件
│   ├── layout/         # 布局组件
│   ├── pages/          # 页面组件
│   ├── room/           # 房间相关组件
│   └── ui/             # 基础UI组件
├── services/           # 服务层
│   ├── StorageService.ts
│   └── TemplateService.ts
├── store/              # 状态管理
│   └── roomStore.ts
├── styles/             # 样式文件
│   ├── design-tokens.css
│   └── global.css
├── types/              # 类型定义
│   └── common.ts
└── utils/              # 工具函数
```

## 🧪 测试

### 运行测试
```bash
# 运行端到端测试
npm run test:e2e

# 运行组件测试  
npm run test:component

# 生成测试报告
npm run test:report
```

### 测试覆盖
- ✅ 应用启动测试
- ✅ 玩家设置流程  
- ✅ 房间创建和加入
- ✅ 模板选择和切换
- ✅ 游戏启动流程
- ✅ 响应式设计验证
- ✅ 性能基准测试

## 🔧 开发指南

### 脚本命令
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 代码规范检查
npm run type-check   # TypeScript类型检查
```

### 添加新游戏模板
1. 在 `src/store/roomStore.ts` 中添加模板定义
2. 在 `GameRoomPage.tsx` 中添加游戏逻辑
3. 创建对应的CSS样式文件
4. 添加相应的测试用例

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请提交Issue：

**问题报告模板：**
```
### 环境信息
- 浏览器版本：
- 操作系统：
- Node.js版本：

### 问题描述
详细描述遇到的问题...

### 复现步骤
1. 步骤一
2. 步骤二
3. 步骤三

### 期望结果
描述期望的正确行为...
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程
1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- CSS 使用 BEM 命名规范

## 📄 开源协议

本项目基于 MIT 协议开源。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [TypeScript](https://www.typescriptlang.org/) - 类型系统
- [Vite](https://vitejs.dev/) - 构建工具
- [Cypress](https://www.cypress.io/) - 端到端测试

---

**⭐ 如果这个项目对您有帮助，请给我们一个星标！**

## 📞 联系方式

- 邮箱：libin7099901@163.com
- GitHub：[@libin7099901](https://github.com/libin7099901)

---

## 🚀 版本历史

### v1.0.0 (2024-05-24)
- ✨ 初始版本发布
- 🎮 基础游戏房间功能
- 🎯 三种游戏模板
- 🤖 演示模式和AI助手
- 📱 响应式设计
- 🧪 完整测试覆盖 