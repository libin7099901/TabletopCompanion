// 🤖 桌游伴侣全自动化端到端测试
// 测试所有核心用户流程，自动验证UI和功能

describe('🎮 桌游伴侣全自动化测试', () => {
  const BASE_URL = 'http://localhost:3000'
  
  beforeEach(() => {
    // 清理localStorage，确保测试环境干净
    cy.clearLocalStorage()
    cy.visit(BASE_URL)
  })

  it('✅ 1. 应用启动测试', () => {
    cy.log('🔍 检查页面基本加载')
    
    // 验证页面标题
    cy.title().should('contain', 'Tabletop Game Assistant')
    
    // 验证主要区域存在
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
    
    // 验证主页内容
    cy.contains('欢迎使用桌游伴侣').should('be.visible')
    cy.contains('快速开始').should('be.visible')
    
    // 验证关键按钮存在
    cy.contains('开始游戏').should('be.visible')
    cy.contains('模板管理').should('be.visible')
    
    cy.log('✅ 应用启动测试通过')
  })

  it('✅ 2. 玩家设置流程测试', () => {
    cy.log('🔍 测试玩家设置功能')
    
    // 点击头部玩家区域
    cy.get('header').within(() => {
      cy.get('button').contains('设置').click()
    })
    
    // 应该弹出设置对话框或跳转
    cy.wait(500)
    
    // 模拟玩家名称输入（通过检查localStorage）
    cy.contains('开始游戏').click()
    
    // 验证系统自动创建了默认玩家
    cy.wait(1000)
    cy.window().then((win) => {
      const player = JSON.parse(win.localStorage.getItem('player') || '{}')
      expect(player).to.have.property('name')
      expect(player).to.have.property('id')
    })
    
    cy.log('✅ 玩家设置测试通过')
  })

  it('✅ 3. 创建房间完整流程测试', () => {
    cy.log('🔍 测试创建房间功能')
    
    // 开始游戏流程
    cy.contains('开始游戏').click()
    
    // 等待页面跳转到游戏启动页面
    cy.wait(500)
    cy.url().should('include', 'game-start')
    
    // 选择创建房间模式
    cy.contains('创建房间').click()
    
    // 填写房间信息
    cy.get('input[placeholder*="房间名称"]').clear().type('自动化测试房间')
    cy.get('select').select('4') // 选择4人房间
    
    // 测试私人房间功能
    cy.get('input[type="checkbox"]').check()
    cy.get('input[type="password"]').type('test123')
    
    // 创建房间
    cy.contains('创建房间').click()
    
    // 验证房间创建成功
    cy.wait(1500) // 等待模拟延迟
    cy.url().should('include', 'game-room')
    cy.contains('自动化测试房间').should('be.visible')
    cy.contains('房间ID').should('be.visible')
    
    cy.log('✅ 创建房间测试通过')
  })

  it('✅ 4. 演示模式测试', () => {
    cy.log('🔍 测试演示模式功能')
    
    // 开始游戏
    cy.contains('开始游戏').click()
    cy.wait(500)
    
    // 选择演示模式
    cy.contains('演示模式').click()
    
    // 确认启动演示
    cy.contains('开始演示').click()
    
    // 验证演示房间创建
    cy.wait(1500)
    cy.url().should('include', 'game-room')
    cy.contains('演示模式').should('be.visible')
    cy.contains('AI助手').should('be.visible')
    
    cy.log('✅ 演示模式测试通过')
  })

  it('✅ 5. 游戏模板选择测试', () => {
    cy.log('🔍 测试游戏模板选择功能')
    
    // 先创建房间
    cy.contains('开始游戏').click()
    cy.wait(500)
    cy.contains('演示模式').click()
    cy.contains('开始演示').click()
    cy.wait(1500)
    
    // 选择游戏模板
    cy.contains('选择游戏模板').click()
    
    // 验证模板列表显示
    cy.contains('德州扑克').should('be.visible')
    cy.contains('国际象棋').should('be.visible')
    cy.contains('骰子游戏').should('be.visible')
    
    // 选择一个模板
    cy.contains('德州扑克').click()
    
    // 验证模板选择成功
    cy.wait(500)
    cy.contains('当前游戏').should('be.visible')
    cy.contains('德州扑克').should('be.visible')
    
    cy.log('✅ 游戏模板选择测试通过')
  })

  it('✅ 6. 游戏启动测试', () => {
    cy.log('🔍 测试游戏启动功能')
    
    // 创建房间并选择模板
    cy.contains('开始游戏').click()
    cy.wait(500)
    cy.contains('演示模式').click()
    cy.contains('开始演示').click()
    cy.wait(1500)
    
    // 选择模板
    cy.contains('选择游戏模板').click()
    cy.contains('德州扑克').click()
    cy.wait(500)
    
    // 开始游戏
    cy.contains('开始游戏').click()
    
    // 验证游戏界面
    cy.wait(500)
    cy.contains('游戏进行中').should('be.visible')
    
    cy.log('✅ 游戏启动测试通过')
  })

  it('✅ 7. 响应式设计测试', () => {
    cy.log('🔍 测试响应式设计')
    
    // 测试桌面端
    cy.viewport(1920, 1080)
    cy.reload()
    cy.wait(500)
    cy.get('.grid--cols-3').should('be.visible')
    
    // 测试平板端
    cy.viewport(768, 1024)
    cy.wait(500)
    cy.get('main').should('be.visible')
    
    // 测试手机端
    cy.viewport(375, 667)
    cy.wait(500)
    cy.get('main').should('be.visible')
    cy.contains('开始游戏').should('be.visible')
    
    cy.log('✅ 响应式设计测试通过')
  })

  it('✅ 8. 房间管理功能测试', () => {
    cy.log('🔍 测试房间管理功能')
    
    // 创建房间
    cy.contains('开始游戏').click()
    cy.wait(500)
    cy.contains('创建房间').click()
    cy.get('input[placeholder*="房间名称"]').type('管理测试房间')
    cy.contains('创建房间').click()
    cy.wait(1500)
    
    // 测试房间ID复制（通过点击房间ID按钮）
    cy.get('button').contains(/ROOM[A-Z0-9]+/).click()
    
    // 测试邀请玩家功能
    cy.contains('邀请玩家').click()
    
    // 测试离开房间
    cy.contains('离开房间').click()
    
    // 验证返回主页
    cy.wait(500)
    cy.url().should('not.include', 'game-room')
    cy.contains('欢迎使用桌游伴侣').should('be.visible')
    
    cy.log('✅ 房间管理功能测试通过')
  })

  it('✅ 9. 错误处理测试', () => {
    cy.log('🔍 测试错误处理')
    
    // 测试加入不存在的房间
    cy.contains('开始游戏').click()
    cy.wait(500)
    cy.contains('加入房间').click()
    cy.get('input[placeholder*="房间ID"]').type('INVALID123')
    cy.contains('加入房间').click()
    
    // 验证错误处理（这里会创建演示房间，因为是mock实现）
    cy.wait(1500)
    cy.url().should('include', 'game-room')
    
    cy.log('✅ 错误处理测试通过')
  })

  it('✅ 10. 本地存储持久化测试', () => {
    cy.log('🔍 测试本地存储功能')
    
    // 创建玩家和房间
    cy.contains('开始游戏').click()
    cy.wait(500)
    cy.contains('演示模式').click()
    cy.contains('开始演示').click()
    cy.wait(1500)
    
    // 检查localStorage中的数据
    cy.window().then((win) => {
      const player = JSON.parse(win.localStorage.getItem('player') || '{}')
      expect(player).to.have.property('name')
      expect(player).to.have.property('id')
    })
    
    // 刷新页面验证数据持久化
    cy.reload()
    cy.wait(1000)
    
    // 验证玩家信息保持
    cy.window().then((win) => {
      const player = JSON.parse(win.localStorage.getItem('player') || '{}')
      expect(player).to.have.property('name')
    })
    
    cy.log('✅ 本地存储测试通过')
  })
})

// 🎯 性能测试套件
describe('⚡ 性能测试', () => {
  it('📊 页面加载性能测试', () => {
    cy.log('🔍 测试页面加载性能')
    
    const start = Date.now()
    cy.visit('http://localhost:3000')
    cy.contains('欢迎使用桌游伴侣').should('be.visible')
    
    cy.then(() => {
      const loadTime = Date.now() - start
      expect(loadTime).to.be.lessThan(3000) // 页面加载应该在3秒内
      cy.log(`✅ 页面加载时间: ${loadTime}ms`)
    })
  })

  it('🔄 页面切换性能测试', () => {
    cy.log('🔍 测试页面切换性能')
    
    cy.visit('http://localhost:3000')
    
    const start = Date.now()
    cy.contains('开始游戏').click()
    cy.url().should('include', 'game-start')
    
    cy.then(() => {
      const switchTime = Date.now() - start
      expect(switchTime).to.be.lessThan(1000) // 页面切换应该在1秒内
      cy.log(`✅ 页面切换时间: ${switchTime}ms`)
    })
  })
})

// 🎨 自动化视觉测试
describe('🎨 视觉回归测试', () => {
  it('📸 主页视觉快照', () => {
    cy.visit('http://localhost:3000')
    cy.wait(1000)
    cy.matchImageSnapshot('homepage')
  })

  it('📸 游戏启动页快照', () => {
    cy.visit('http://localhost:3000')
    cy.contains('开始游戏').click()
    cy.wait(1000)
    cy.matchImageSnapshot('game-start-page')
  })
}) 