describe('AI助手测试', () => {
  beforeEach(() => {
    // 设置玩家信息
    cy.visit('/')
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="player-setup"]').length > 0) {
        cy.setupPlayer('测试玩家', '👤')
      }
    })
  })

  it('应该能够在游戏中打开AI助手', () => {
    // 先创建或加入一个游戏
    cy.contains('开始游戏').click()
    
    // 等待进入房间管理界面
    cy.get('[data-testid="room-manager"]', { timeout: 10000 }).should('be.visible')
    
    // 创建房间
    cy.contains('创建房间').click()
    cy.get('[data-testid="room-name-input"]').type('AI测试房间')
    cy.get('[data-testid="create-room-confirm"]').click()
    
    // 等待进入房间大厅
    cy.get('[data-testid="room-lobby"]', { timeout: 10000 }).should('be.visible')
    
    // 开始游戏
    cy.get('[data-testid="start-game-button"]').click()
    
    // 等待游戏界面加载
    cy.get('[data-testid="game-interface"]', { timeout: 15000 }).should('be.visible')
    
    // 打开AI助手
    cy.get('[data-testid="ai-assistant-button"]').click()
    
    // 验证AI助手面板打开
    cy.get('[data-testid="ai-assistant-panel"]').should('be.visible')
    cy.contains('AI游戏助手').should('be.visible')
  })

  it('应该显示AI助手的欢迎消息', () => {
    // 模拟进入游戏并打开AI助手
    cy.visit('/game/test-room') // 直接访问游戏页面（如果路由支持）
    
    cy.get('[data-testid="ai-assistant-button"]').click()
    
    // 验证欢迎消息
    cy.get('[data-testid="ai-welcome-message"]').should('contain', '您好！我是您的桌游AI助手')
  })

  it('应该显示快速查询按钮', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 验证快速查询按钮
    cy.get('[data-testid="quick-queries"]').within(() => {
      cy.contains('游戏规则是什么？').should('be.visible')
      cy.contains('我现在可以做什么？').should('be.visible')
      cy.contains('怎么计分？').should('be.visible')
      cy.contains('有什么策略建议？').should('be.visible')
      cy.contains('游戏怎么结束？').should('be.visible')
    })
  })

  it('应该能够点击快速查询按钮', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 点击快速查询按钮
    cy.contains('游戏规则是什么？').click()
    
    // 验证问题被填入输入框
    cy.get('[data-testid="ai-question-input"]').should('have.value', '游戏规则是什么？')
  })

  it('应该能够发送自定义问题', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    const question = '我手中的牌有什么用？'
    
    // 输入问题
    cy.get('[data-testid="ai-question-input"]').type(question)
    
    // 发送问题
    cy.get('[data-testid="ai-send-button"]').click()
    
    // 验证问题显示在对话历史中
    cy.get('[data-testid="chat-history"]').should('contain', question)
    
    // 验证AI回答（可能需要等待）
    cy.get('[data-testid="ai-response"]', { timeout: 10000 }).should('be.visible')
  })

  it('应该显示AI回答的置信度', () => {
    cy.visit('/game/test-room')
    cy.askAIQuestion('什么是红桃A？')
    
    // 验证置信度显示
    cy.get('[data-testid="confidence-score"]').should('be.visible')
    cy.get('[data-testid="confidence-score"]').should('contain', '置信度:')
  })

  it('应该显示建议动作列表', () => {
    cy.visit('/game/test-room')
    cy.askAIQuestion('我现在应该怎么做？')
    
    // 验证建议动作
    cy.get('[data-testid="suggested-actions"]').should('be.visible')
    cy.get('[data-testid="suggested-actions"]').should('contain', '建议动作:')
  })

  it('应该显示相关规则列表', () => {
    cy.visit('/game/test-room')
    cy.askAIQuestion('红桃A的规则是什么？')
    
    // 验证相关规则
    cy.get('[data-testid="related-rules"]').should('be.visible')
    cy.get('[data-testid="related-rules"]').should('contain', '相关规则:')
  })

  it('应该能够清空对话历史', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 发送一些问题
    cy.askAIQuestion('测试问题1')
    cy.askAIQuestion('测试问题2')
    
    // 清空历史
    cy.get('[data-testid="clear-history-button"]').click()
    
    // 验证历史被清空
    cy.get('[data-testid="chat-history"]').should('not.contain', '测试问题1')
    cy.get('[data-testid="chat-history"]').should('not.contain', '测试问题2')
  })

  it('应该能够关闭AI助手面板', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 关闭面板
    cy.get('[data-testid="ai-close-button"]').click()
    
    // 验证面板关闭
    cy.get('[data-testid="ai-assistant-panel"]').should('not.be.visible')
  })

  it('应该显示实时游戏提示', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 验证实时提示区域
    cy.get('[data-testid="game-hints"]').should('be.visible')
    cy.get('[data-testid="game-hints"]').should('contain', '实时提示')
  })

  it('应该能够隐藏/显示游戏提示', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 隐藏提示
    cy.get('[data-testid="toggle-hints-button"]').click()
    cy.get('[data-testid="hints-content"]').should('not.be.visible')
    
    // 显示提示
    cy.get('[data-testid="toggle-hints-button"]').click()
    cy.get('[data-testid="hints-content"]').should('be.visible')
  })

  it('应该处理AI服务错误', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 模拟网络错误或服务不可用
    cy.intercept('POST', '/api/ai/**', { statusCode: 500, body: { error: 'Service unavailable' } })
    
    cy.askAIQuestion('测试问题')
    
    // 验证错误处理
    cy.get('[data-testid="ai-error-message"]').should('contain', '抱歉，AI助手暂时不可用')
  })

  it('应该支持键盘快捷键', () => {
    cy.visit('/game/test-room')
    cy.openAIAssistant()
    
    // 输入问题
    cy.get('[data-testid="ai-question-input"]').type('测试问题')
    
    // 使用Enter键发送
    cy.get('[data-testid="ai-question-input"]').type('{enter}')
    
    // 验证问题被发送
    cy.get('[data-testid="chat-history"]').should('contain', '测试问题')
  })
}) 