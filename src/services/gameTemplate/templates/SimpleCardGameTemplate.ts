import { GameTemplate } from '../GameTemplateEngine';

// 简单比大小纸牌游戏模板
export const SimpleCardGameTemplate: GameTemplate = {
  id: 'simple-card-compare',
  name: '简单比大小',
  version: '1.0.0',
  description: '一个简单的纸牌比大小游戏，玩家同时出牌，大的获胜',
  type: 'card',
  minPlayers: 2,
  maxPlayers: 4,
  estimatedDuration: 15,
  
  rules: {
    setup: {
      initialState: {
        gamePhase: 'dealing',
        roundNumber: 1,
        maxRounds: 5
      },
      playerSetup: [
        { property: 'score', value: 0 },
        { property: 'cardsWon', value: 0 }
      ],
      cardSetup: {
        deck: [
          // 标准52张牌
          // 黑桃 (Spades) - 值: 13-1
          { id: 'spade_a', name: '黑桃A', type: 'spade', cost: 0, power: 14, count: 1 },
          { id: 'spade_k', name: '黑桃K', type: 'spade', cost: 0, power: 13, count: 1 },
          { id: 'spade_q', name: '黑桃Q', type: 'spade', cost: 0, power: 12, count: 1 },
          { id: 'spade_j', name: '黑桃J', type: 'spade', cost: 0, power: 11, count: 1 },
          { id: 'spade_10', name: '黑桃10', type: 'spade', cost: 0, power: 10, count: 1 },
          { id: 'spade_9', name: '黑桃9', type: 'spade', cost: 0, power: 9, count: 1 },
          { id: 'spade_8', name: '黑桃8', type: 'spade', cost: 0, power: 8, count: 1 },
          { id: 'spade_7', name: '黑桃7', type: 'spade', cost: 0, power: 7, count: 1 },
          { id: 'spade_6', name: '黑桃6', type: 'spade', cost: 0, power: 6, count: 1 },
          { id: 'spade_5', name: '黑桃5', type: 'spade', cost: 0, power: 5, count: 1 },
          { id: 'spade_4', name: '黑桃4', type: 'spade', cost: 0, power: 4, count: 1 },
          { id: 'spade_3', name: '黑桃3', type: 'spade', cost: 0, power: 3, count: 1 },
          { id: 'spade_2', name: '黑桃2', type: 'spade', cost: 0, power: 2, count: 1 },
          
          // 红桃 (Hearts) - 值: 13-1
          { id: 'heart_a', name: '红桃A', type: 'heart', cost: 0, power: 14, count: 1 },
          { id: 'heart_k', name: '红桃K', type: 'heart', cost: 0, power: 13, count: 1 },
          { id: 'heart_q', name: '红桃Q', type: 'heart', cost: 0, power: 12, count: 1 },
          { id: 'heart_j', name: '红桃J', type: 'heart', cost: 0, power: 11, count: 1 },
          { id: 'heart_10', name: '红桃10', type: 'heart', cost: 0, power: 10, count: 1 },
          { id: 'heart_9', name: '红桃9', type: 'heart', cost: 0, power: 9, count: 1 },
          { id: 'heart_8', name: '红桃8', type: 'heart', cost: 0, power: 8, count: 1 },
          { id: 'heart_7', name: '红桃7', type: 'heart', cost: 0, power: 7, count: 1 },
          { id: 'heart_6', name: '红桃6', type: 'heart', cost: 0, power: 6, count: 1 },
          { id: 'heart_5', name: '红桃5', type: 'heart', cost: 0, power: 5, count: 1 },
          { id: 'heart_4', name: '红桃4', type: 'heart', cost: 0, power: 4, count: 1 },
          { id: 'heart_3', name: '红桃3', type: 'heart', cost: 0, power: 3, count: 1 },
          { id: 'heart_2', name: '红桃2', type: 'heart', cost: 0, power: 2, count: 1 },
          
          // 梅花 (Clubs) - 值: 13-1
          { id: 'club_a', name: '梅花A', type: 'club', cost: 0, power: 14, count: 1 },
          { id: 'club_k', name: '梅花K', type: 'club', cost: 0, power: 13, count: 1 },
          { id: 'club_q', name: '梅花Q', type: 'club', cost: 0, power: 12, count: 1 },
          { id: 'club_j', name: '梅花J', type: 'club', cost: 0, power: 11, count: 1 },
          { id: 'club_10', name: '梅花10', type: 'club', cost: 0, power: 10, count: 1 },
          { id: 'club_9', name: '梅花9', type: 'club', cost: 0, power: 9, count: 1 },
          { id: 'club_8', name: '梅花8', type: 'club', cost: 0, power: 8, count: 1 },
          { id: 'club_7', name: '梅花7', type: 'club', cost: 0, power: 7, count: 1 },
          { id: 'club_6', name: '梅花6', type: 'club', cost: 0, power: 6, count: 1 },
          { id: 'club_5', name: '梅花5', type: 'club', cost: 0, power: 5, count: 1 },
          { id: 'club_4', name: '梅花4', type: 'club', cost: 0, power: 4, count: 1 },
          { id: 'club_3', name: '梅花3', type: 'club', cost: 0, power: 3, count: 1 },
          { id: 'club_2', name: '梅花2', type: 'club', cost: 0, power: 2, count: 1 },
          
          // 方片 (Diamonds) - 值: 13-1
          { id: 'diamond_a', name: '方片A', type: 'diamond', cost: 0, power: 14, count: 1 },
          { id: 'diamond_k', name: '方片K', type: 'diamond', cost: 0, power: 13, count: 1 },
          { id: 'diamond_q', name: '方片Q', type: 'diamond', cost: 0, power: 12, count: 1 },
          { id: 'diamond_j', name: '方片J', type: 'diamond', cost: 0, power: 11, count: 1 },
          { id: 'diamond_10', name: '方片10', type: 'diamond', cost: 0, power: 10, count: 1 },
          { id: 'diamond_9', name: '方片9', type: 'diamond', cost: 0, power: 9, count: 1 },
          { id: 'diamond_8', name: '方片8', type: 'diamond', cost: 0, power: 8, count: 1 },
          { id: 'diamond_7', name: '方片7', type: 'diamond', cost: 0, power: 7, count: 1 },
          { id: 'diamond_6', name: '方片6', type: 'diamond', cost: 0, power: 6, count: 1 },
          { id: 'diamond_5', name: '方片5', type: 'diamond', cost: 0, power: 5, count: 1 },
          { id: 'diamond_4', name: '方片4', type: 'diamond', cost: 0, power: 4, count: 1 },
          { id: 'diamond_3', name: '方片3', type: 'diamond', cost: 0, power: 3, count: 1 },
          { id: 'diamond_2', name: '方片2', type: 'diamond', cost: 0, power: 2, count: 1 }
        ],
        handSize: 13, // 每人分配13张牌
        dealingOrder: 'clockwise'
      }
    },
    
    gameplay: {
      turnStructure: {
        order: 'clockwise',
        timeLimit: 30 // 30秒思考时间
      },
      phases: [
        {
          id: 'play_card',
          name: '出牌阶段',
          description: '每个玩家选择一张牌出牌',
          actions: ['play_card'],
          nextPhase: 'reveal'
        },
        {
          id: 'reveal',
          name: '翻牌阶段',
          description: '同时翻开所有牌，比较大小',
          actions: ['reveal_cards'],
          nextPhase: 'score'
        },
        {
          id: 'score',
          name: '计分阶段',
          description: '大的牌获得分数',
          actions: ['calculate_score'],
          nextPhase: 'play_card'
        }
      ],
      validMoves: [
        {
          actionType: 'play_card',
          conditions: [
            {
              type: 'state',
              property: 'hasPlayedCard',
              operator: '==',
              value: false
            }
          ],
          effects: [
            {
              type: 'modify',
              target: 'player',
              parameters: { hasPlayedCard: true }
            }
          ]
        }
      ],
      specialRules: []
    },
    
    scoring: {
      scoreType: 'points',
      scoreCalculation: [
        {
          source: 'cardsWon',
          formula: 'cardsWon * 1',
          weight: 1
        }
      ],
      bonuses: [
        {
          condition: [
            {
              type: 'resource',
              property: 'cardsWon',
              operator: '>=',
              value: 7
            }
          ],
          bonus: 5,
          description: '获得7张或以上牌的奖励'
        }
      ]
    },
    
    endConditions: [
      {
        type: 'objective',
        condition: [
          {
            type: 'state',
            property: 'roundNumber',
            operator: '>',
            value: 13
          }
        ],
        result: 'win'
      }
    ],
    
    actions: [
      {
        id: 'play_card',
        name: '出牌',
        description: '从手牌中选择一张牌出牌',
        type: 'play_card',
        requirements: [
          {
            type: 'state',
            property: 'hasPlayedCard',
            operator: '==',
            value: false
          }
        ],
        effects: [
          {
            type: 'modify',
            target: 'playedCards',
            parameters: { action: 'add' }
          }
        ]
      },
      {
        id: 'reveal_cards',
        name: '翻牌',
        description: '翻开所有已出的牌',
        type: 'custom',
        requirements: [],
        effects: [
          {
            type: 'trigger',
            target: 'compare_cards',
            parameters: {}
          }
        ]
      },
      {
        id: 'calculate_score',
        name: '计算分数',
        description: '为获胜者加分',
        type: 'custom',
        requirements: [],
        effects: [
          {
            type: 'modify',
            target: 'winner',
            parameters: { action: 'add_score' }
          }
        ]
      }
    ]
  },
  
  assets: {
    images: [
      { id: 'card_back', name: '牌背', path: 'assets/cards/card_back.png', type: 'image' },
      { id: 'spade_suit', name: '黑桃花色', path: 'assets/cards/spade.png', type: 'image' },
      { id: 'heart_suit', name: '红桃花色', path: 'assets/cards/heart.png', type: 'image' },
      { id: 'club_suit', name: '梅花花色', path: 'assets/cards/club.png', type: 'image' },
      { id: 'diamond_suit', name: '方片花色', path: 'assets/cards/diamond.png', type: 'image' }
    ],
    sounds: [
      { id: 'card_flip', name: '翻牌音效', path: 'assets/sounds/card_flip.mp3', type: 'audio' },
      { id: 'win_sound', name: '获胜音效', path: 'assets/sounds/win.mp3', type: 'audio' }
    ]
  },
  
  metadata: {
    author: '桌游伴侣开发团队',
    created: '2025-01-27',
    lastModified: '2025-01-27',
    tags: ['纸牌', '比大小', '简单', '快节奏'],
    difficulty: 'easy',
    category: ['卡牌游戏', '策略游戏'],
    language: 'zh-CN'
  }
};

export default SimpleCardGameTemplate; 