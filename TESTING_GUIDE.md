# 测试指南

## 测试概述

桌游伴侣项目使用多层次的测试策略，确保应用的质量和稳定性：

- **单元测试** - 使用 Vitest + Testing Library 测试组件和函数
- **集成测试** - 测试组件间的交互和数据流
- **端到端测试** - 使用 Cypress 测试完整的用户工作流

## 🧪 测试框架

### 主要工具

- **Vitest** - 快速的单元测试框架，与 Vite 深度集成
- **React Testing Library** - React 组件测试工具
- **Cypress** - 现代化的端到端测试框架
- **Jest DOM** - 提供额外的 DOM 测试断言

### 模拟工具

- **WebRTC APIs** - 模拟浏览器 WebRTC 功能
- **WebSocket** - 模拟实时通信
- **LocalStorage** - 模拟本地存储
- **Crypto APIs** - 模拟加密功能

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm run test:all
```

## 📋 测试命令

### 单元测试

```bash
# 运行单元测试（监听模式）
npm run test

# 运行单元测试（单次）
npm run test:run

# 运行测试覆盖率
npm run test:coverage

# 启动测试 UI 界面
npm run test:ui

# 监听模式运行测试
npm run test:watch
```

### E2E 测试

```bash
# 打开 Cypress 测试界面
npm run cypress:open

# 在命令行运行 E2E 测试
npm run cypress:run

# 无头模式运行 E2E 测试
npm run cypress:run:headless

# 启动开发服务器并运行 E2E 测试
npm run e2e

# 启动开发服务器并打开 Cypress
npm run e2e:open
```

## 📁 测试结构

```
项目根目录/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   └── __tests__/           # 页面组件测试
│   │   ├── ai/
│   │   │   └── __tests__/           # AI组件测试
│   │   └── room/
│   │       └── __tests__/           # 房间组件测试
│   ├── services/
│   │   ├── webrtc/
│   │   │   └── __tests__/           # WebRTC服务测试
│   │   └── ai/
│   │       └── __tests__/           # AI服务测试
│   └── test/
│       └── setup.ts                 # 测试环境配置
├── cypress/
│   ├── e2e/                         # E2E测试用例
│   ├── support/
│   │   ├── commands.ts              # 自定义Cypress命令
│   │   └── e2e.ts                   # E2E测试配置
│   └── fixtures/                    # 测试数据
├── vitest.config.ts                 # Vitest配置
└── cypress.config.ts                # Cypress配置
```

## 🧩 单元测试

### 组件测试示例

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import HomePage from '../HomePage'

describe('HomePage', () => {
  it('应该渲染欢迎消息', () => {
    render(<HomePage />)
    expect(screen.getByText('欢迎使用桌游伴侣')).toBeInTheDocument()
  })

  it('应该处理按钮点击', () => {
    const mockOnClick = vi.fn()
    render(<HomePage onCreateRoom={mockOnClick} />)
    
    fireEvent.click(screen.getByText('创建房间'))
    expect(mockOnClick).toHaveBeenCalled()
  })
})
```

### 服务测试示例

```typescript
import { vi, describe, it, expect } from 'vitest'
import { WebRTCManager } from '../WebRTCManager'

describe('WebRTCManager', () => {
  it('应该创建P2P连接', async () => {
    const manager = new WebRTCManager()
    const connection = await manager.createPeerConnection('peer-1', mockPlayer)
    
    expect(connection.id).toBe('peer-1')
    expect(connection.status).toBe('connecting')
  })
})
```

### 测试最佳实践

1. **描述清晰** - 使用中文描述测试用例
2. **独立性** - 每个测试应该独立运行
3. **Mock 外部依赖** - 模拟 API 调用和浏览器 API
4. **测试用户行为** - 专注于用户如何使用应用

## 🌐 端到端测试

### 自定义命令

Cypress 提供了一套自定义命令，简化测试编写：

```typescript
// 设置玩家信息
cy.setupPlayer('测试玩家', '👤')

// 创建房间
cy.createRoom('测试房间', 4)

// 加入房间
cy.joinRoom('room-id-123')

// 开始游戏
cy.startGame()

// 打开AI助手
cy.openAIAssistant()

// 向AI提问
cy.askAIQuestion('游戏规则是什么？')
```

### E2E 测试示例

```typescript
describe('用户游戏流程', () => {
  it('应该能够完成完整游戏流程', () => {
    // 设置玩家
    cy.setupPlayer('玩家1', '👤')
    
    // 创建房间
    cy.createRoom('测试房间')
    
    // 开始游戏
    cy.startGame()
    
    // 使用AI助手
    cy.openAIAssistant()
    cy.askAIQuestion('我应该怎么出牌？')
    
    // 验证AI回答
    cy.get('[data-testid="ai-response"]').should('be.visible')
  })
})
```

## 📊 测试覆盖率

### 目标覆盖率

- **语句覆盖率**: 85%+
- **分支覆盖率**: 80%+
- **函数覆盖率**: 90%+
- **行覆盖率**: 85%+

### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 报告位置
open coverage/index.html
```

### 覆盖率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'html', 'json-summary'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/'
      ]
    }
  }
})
```

## 🛠️ 测试配置

### Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true
  }
})
```

### Cypress 配置

```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000
  }
})
```

## 🔧 模拟与存根

### WebRTC 模拟

```typescript
// 测试环境自动模拟 WebRTC APIs
global.RTCPeerConnection = vi.fn(() => ({
  createOffer: vi.fn(),
  createAnswer: vi.fn(),
  setLocalDescription: vi.fn(),
  setRemoteDescription: vi.fn()
}))
```

### WebSocket 模拟

```typescript
global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  addEventListener: vi.fn(),
  readyState: 1
}))
```

### localStorage 模拟

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock
```

## 🚨 CI/CD 集成

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:run
        
      - name: Run E2E tests
        run: npm run e2e
```

### 测试环境变量

```bash
# .env.test
VITE_SIGNALING_SERVER_URL=ws://localhost:8080
VITE_STUN_SERVERS=stun:stun.l.google.com:19302
CYPRESS_BASE_URL=http://localhost:5173
```

## 📝 编写测试指南

### 组件测试

1. **渲染测试** - 验证组件正常渲染
2. **交互测试** - 测试用户交互行为
3. **状态测试** - 验证状态变化
4. **Props 测试** - 测试不同 props 的影响

### 服务测试

1. **API 测试** - 测试服务方法调用
2. **错误处理** - 测试异常情况
3. **状态管理** - 测试内部状态变化
4. **事件系统** - 测试事件发射和监听

### E2E 测试

1. **用户流程** - 测试完整的用户工作流
2. **跨浏览器** - 在不同浏览器中测试
3. **响应式** - 测试不同屏幕尺寸
4. **错误场景** - 测试网络错误等异常情况

## 🐛 调试测试

### Vitest 调试

```bash
# 运行特定测试
npm run test -- HomePage.test.tsx

# 调试模式
npm run test -- --reporter=verbose

# 监听模式
npm run test:watch
```

### Cypress 调试

```bash
# 打开 Cypress 测试界面
npm run cypress:open

# 调试特定测试
npx cypress run --spec="cypress/e2e/homepage.cy.ts"

# 启用调试信息
DEBUG=cypress:* npm run cypress:run
```

## 📈 性能测试

### 组件渲染性能

```typescript
it('应该快速渲染大量数据', () => {
  const startTime = performance.now()
  render(<GameInterface players={largePlayers} />)
  const endTime = performance.now()
  
  expect(endTime - startTime).toBeLessThan(100) // 100ms内完成
})
```

### 网络性能测试

```typescript
// Cypress中测试加载时间
cy.visit('/', {
  onBeforeLoad: (win) => {
    win.performance.mark('start')
  },
  onLoad: (win) => {
    win.performance.mark('end')
    win.performance.measure('pageLoad', 'start', 'end')
    const measure = win.performance.getEntriesByName('pageLoad')[0]
    expect(measure.duration).to.be.lessThan(3000)
  }
})
```

## 🔍 测试工具和技巧

### 有用的测试工具

- **screen.debug()** - 打印当前DOM结构
- **waitFor()** - 等待异步操作完成
- **userEvent** - 模拟真实用户交互
- **cy.intercept()** - 拦截和模拟网络请求

### 常见问题解决

1. **异步测试** - 使用 `waitFor` 等待状态更新
2. **Mock 问题** - 确保在 `beforeEach` 中清理 mock
3. **DOM 查询** - 使用 `data-testid` 属性标识元素
4. **定时器** - 使用 `vi.useFakeTimers()` 控制时间

## 📚 学习资源

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 指南](https://testing-library.com/)
- [Cypress 最佳实践](https://docs.cypress.io/)
- [React 测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**注意**: 保持测试代码的简洁和可维护性，定期更新测试用例以反映应用的变化。 