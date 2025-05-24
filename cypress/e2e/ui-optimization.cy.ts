/// <reference types="cypress" />

describe('UI优化验证', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('应该显示优化后的主页布局', () => {
    // 验证Header导航精简
    cy.get('[data-cy="header"]').within(() => {
      cy.contains('主页').should('exist')
      cy.contains('模板库').should('exist')
      // 验证只有2个导航项，不再有"房间"和"帮助"
      cy.get('.nav-button').should('have.length', 2)
    })

    // 验证主页内容结构
    cy.contains('欢迎使用桌游伴侣').should('exist')
    cy.contains('快速开始').should('exist')
    
    // 验证快速行动卡片对齐且没有重复
    cy.get('.action-cards').within(() => {
      cy.contains('开始游戏').should('exist')
      cy.contains('模板管理').should('exist')
      cy.contains('设置玩家').should('exist')
    })

    // 验证没有模板展示区域（因为有专门的模板管理页面）
    cy.contains('我的游戏模板').should('not.exist')
  })

  it('应该能够在主页和模板管理页面之间导航', () => {
    // 点击模板管理卡片
    cy.contains('模板管理').click()
    
    // 验证进入模板管理页面
    cy.url().should('not.contain', '/')
    cy.contains('模板管理').should('exist')
    cy.contains('我的模板').should('exist')
    
    // 验证可以返回主页
    cy.contains('返回主页').click()
    cy.contains('欢迎使用桌游伴侣').should('exist')
  })

  it('应该能够通过Header导航', () => {
    // 通过Header导航到模板库
    cy.get('.nav-button').contains('模板库').click()
    cy.contains('模板管理').should('exist')
    
    // 验证导航状态
    cy.get('.nav-button.active').should('contain', '模板库')
    
    // 返回主页
    cy.get('.nav-button').contains('主页').click()
    cy.contains('欢迎使用桌游伴侣').should('exist')
    cy.get('.nav-button.active').should('contain', '主页')
  })

  it('应该在设置玩家后隐藏设置玩家卡片', () => {
    // 验证未设置玩家时显示设置玩家卡片
    cy.contains('设置玩家').should('exist')
    
    // 手动设置玩家信息
    cy.contains('设置玩家').click()
    
    // 假设有玩家设置表单
    cy.get('input[type="text"]').first().clear().type('测试玩家')
    cy.contains('完成设置').click()
    
    // 验证设置玩家后该卡片不再显示
    cy.contains('设置玩家').should('not.exist')
    cy.contains('欢迎回来，测试玩家！').should('exist')
  })

  it('应该在模板管理页面正常工作', () => {
    // 进入模板管理页面
    cy.contains('模板管理').click()
    
    // 验证空状态
    cy.contains('还没有游戏模板').should('exist')
    
    // 创建示例模板
    cy.contains('创建示例模板').click()
    
    // 验证模板已添加
    cy.get('.template-card').should('exist')
    cy.contains('简单比大小').should('exist')
    
    // 验证模板操作功能
    cy.get('.template-card').first().within(() => {
      cy.contains('编辑').should('exist')
      cy.contains('复制').should('exist')
      cy.contains('删除').should('exist')
    })
  })

  it('应该显示功能介绍区域', () => {
    cy.contains('功能特性').should('exist')
    cy.contains('实时多人游戏').should('exist')
    cy.contains('游戏模板系统').should('exist')
    cy.contains('AI智能助手').should('exist')
    cy.contains('数据同步').should('exist')
  })

  it('应该有响应式设计', () => {
    // 测试移动端视图
    cy.viewport(375, 667)
    
    // 验证移动端Header布局
    cy.get('.header-content').should('be.visible')
    
    // 验证移动端卡片布局
    cy.get('.action-cards').should('be.visible')
    cy.get('.action-card').should('be.visible')
  })
}) 