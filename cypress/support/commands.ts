/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// 声明自定义命令的类型
declare global {
  namespace Cypress {
    interface Chainable {
      setupPlayer(name?: string, avatar?: string): Chainable<Element>
      createRoom(roomName?: string, maxPlayers?: number): Chainable<Element>
      joinRoom(roomId: string): Chainable<Element>
      startGame(): Chainable<Element>
      playCard(cardId: string): Chainable<Element>
      openAIAssistant(): Chainable<Element>
      askAIQuestion(question: string): Chainable<Element>
    }
  }
}

// 设置玩家信息
Cypress.Commands.add('setupPlayer', (name = 'Test Player', avatar = '👤') => {
  cy.visit('/')
  
  // 查找并填写玩家昵称
  cy.get('[data-testid="player-name-input"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(name)
  
  // 选择头像
  cy.get(`[data-testid="avatar-${avatar}"]`)
    .should('be.visible')
    .click()
  
  // 保存玩家信息
  cy.get('[data-testid="save-player-info"]')
    .should('be.visible')
    .click()
})

// 创建房间
Cypress.Commands.add('createRoom', (roomName = 'Test Room', maxPlayers = 4) => {
  cy.get('[data-testid="create-room-button"]')
    .should('be.visible')
    .click()
  
  cy.get('[data-testid="room-name-input"]')
    .should('be.visible')
    .clear()
    .type(roomName)
  
  cy.get('[data-testid="max-players-select"]')
    .should('be.visible')
    .select(maxPlayers.toString())
  
  cy.get('[data-testid="confirm-create-room"]')
    .should('be.visible')
    .click()
  
  // 等待房间创建成功
  cy.get('[data-testid="room-lobby"]', { timeout: 10000 })
    .should('be.visible')
})

// 加入房间
Cypress.Commands.add('joinRoom', (roomId: string) => {
  cy.get('[data-testid="join-room-button"]')
    .should('be.visible')
    .click()
  
  cy.get('[data-testid="room-id-input"]')
    .should('be.visible')
    .clear()
    .type(roomId)
  
  cy.get('[data-testid="confirm-join-room"]')
    .should('be.visible')
    .click()
  
  // 等待加入房间成功
  cy.get('[data-testid="room-lobby"]', { timeout: 10000 })
    .should('be.visible')
})

// 开始游戏
Cypress.Commands.add('startGame', () => {
  cy.get('[data-testid="start-game-button"]')
    .should('be.visible')
    .click()
  
  // 等待游戏界面加载
  cy.get('[data-testid="game-interface"]', { timeout: 15000 })
    .should('be.visible')
})

// 出牌
Cypress.Commands.add('playCard', (cardId: string) => {
  cy.get(`[data-testid="card-${cardId}"]`)
    .should('be.visible')
    .click()
  
  cy.get('[data-testid="confirm-play-card"]')
    .should('be.visible')
    .click()
})

// 打开AI助手
Cypress.Commands.add('openAIAssistant', () => {
  cy.get('[data-testid="ai-assistant-button"]')
    .should('be.visible')
    .click()
  
  // 等待AI助手面板打开
  cy.get('[data-testid="ai-assistant-panel"]', { timeout: 5000 })
    .should('be.visible')
})

// 向AI助手提问
Cypress.Commands.add('askAIQuestion', (question: string) => {
  cy.get('[data-testid="ai-question-input"]')
    .should('be.visible')
    .clear()
    .type(question)
  
  cy.get('[data-testid="ai-send-button"]')
    .should('be.visible')
    .click()
  
  // 等待AI回答
  cy.get('[data-testid="ai-response"]', { timeout: 10000 })
    .should('be.visible')
})

export {} 