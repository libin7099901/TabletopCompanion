describe('首页测试', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('应该显示主页标题和欢迎信息', () => {
    cy.get('h1').should('contain', '欢迎使用桌游伴侣')
    cy.get('p').should('contain', '开始您的桌游之旅')
  })

  it('应该显示功能特性卡片', () => {
    cy.get('[data-testid="feature-cards"]').should('be.visible')
    cy.contains('实时多人游戏').should('be.visible')
    cy.contains('游戏模板系统').should('be.visible')
    cy.contains('AI智能助手').should('be.visible')
  })

  it('应该显示快速开始按钮', () => {
    cy.get('[data-testid="quick-start-section"]').should('be.visible')
    cy.contains('开始游戏').should('be.visible')
    cy.contains('模板管理').should('be.visible')
    cy.contains('玩家设置').should('be.visible')
  })

  it('应该能够导航到不同页面', () => {
    // 点击玩家设置
    cy.contains('玩家设置').click()
    cy.url().should('include', '/setup')
    
    // 返回首页
    cy.visit('/')
    
    // 点击模板管理
    cy.contains('模板管理').click()
    cy.url().should('include', '/templates')
  })

  it('应该显示模板展示区域', () => {
    cy.get('[data-testid="templates-section"]').should('be.visible')
    
    // 应该显示空状态或模板列表
    cy.get('[data-testid="templates-grid"], [data-testid="empty-templates"]')
      .should('be.visible')
  })

  it('应该响应式适配不同屏幕尺寸', () => {
    // 测试桌面尺寸
    cy.viewport(1280, 720)
    cy.get('[data-testid="main-content"]').should('be.visible')
    
    // 测试平板尺寸
    cy.viewport(768, 1024)
    cy.get('[data-testid="main-content"]').should('be.visible')
    
    // 测试手机尺寸
    cy.viewport(375, 667)
    cy.get('[data-testid="main-content"]').should('be.visible')
  })

  it('应该能够创建示例模板', () => {
    // 如果没有模板，应该显示创建示例模板按钮
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="create-sample-template"]').length > 0) {
        cy.get('[data-testid="create-sample-template"]').click()
        cy.contains('简单比大小游戏').should('be.visible')
      }
    })
  })

  it('应该能够处理玩家信息设置', () => {
    // 点击玩家设置
    cy.contains('玩家设置').click()
    
    // 应该显示玩家设置界面
    cy.get('[data-testid="player-setup"]').should('be.visible')
    
    // 填写玩家信息
    cy.get('[data-testid="player-name-input"]')
      .clear()
      .type('测试玩家')
    
    // 选择头像
    cy.get('[data-testid="avatar-selection"]').within(() => {
      cy.get('button').first().click()
    })
    
    // 保存设置
    cy.get('[data-testid="save-player-info"]').click()
    
    // 返回首页应该显示玩家信息
    cy.visit('/')
    cy.contains('欢迎回来，测试玩家').should('be.visible')
  })
}) 