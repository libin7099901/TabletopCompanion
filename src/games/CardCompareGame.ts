// 🃏 比大小纸牌游戏

import {
  GameState,
  GameAction,
  GameRules,
  WinResult,
  ActionType,
  Card,
  CardDeck,
  CardSuit,
  CardRank
} from '../types/game';

export class CardCompareRules implements GameRules {
  private readonly ROUNDS_TO_WIN = 3;
  // private readonly CARDS_PER_ROUND = 1;

  // === 规则验证 ===
  
  validateAction(state: GameState, action: GameAction): boolean {
    switch (action.type) {
      case 'draw':
        return this.canDraw(state, action.playerId);
      case 'play':
        return this.canPlay(state, action.playerId, action.data);
      default:
        return false;
    }
  }

  private canDraw(state: GameState, playerId: string): boolean {
    // 只有在发牌阶段且轮到该玩家时才能抽牌
    return state.phase === 'dealing' && 
           state.players[state.currentPlayerIndex].id === playerId &&
           state.deck?.cards.length! > 0;
  }

  private canPlay(state: GameState, playerId: string, cardId: string): boolean {
    if (state.phase !== 'playing') return false;
    
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.hand) return false;
    
    return player.hand.some(card => card.id === cardId);
  }

  // === 动作执行 ===

  executeAction(state: GameState, action: GameAction): GameState {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    
    switch (action.type) {
      case 'draw':
        return this.executeDrawAction(newState, action);
      case 'play':
        return this.executePlayAction(newState, action);
      default:
        return newState;
    }
  }

  private executeDrawAction(state: GameState, action: GameAction): GameState {
    if (!state.deck || state.deck.cards.length === 0) return state;
    
    // 抽取一张牌
    const drawnCard = state.deck.cards.pop()!;
    drawnCard.isVisible = true;
    
    // 给玩家发牌
    const player = state.players.find(p => p.id === action.playerId)!;
    if (!player.hand) player.hand = [];
    player.hand.push(drawnCard);
    
    // 检查是否所有玩家都抽完牌
    const allPlayersHaveCards = state.players.every(p => p.hand && p.hand.length > 0);
    if (allPlayersHaveCards) {
      state.phase = 'playing';
      state.currentPlayerIndex = 0; // 重置到第一个玩家
    }
    
    return state;
  }

  private executePlayAction(state: GameState, action: GameAction): GameState {
    const cardId = action.data as string;
    const player = state.players.find(p => p.id === action.playerId)!;
    
    // 移除玩家手中的牌
    const cardIndex = player.hand!.findIndex(c => c.id === cardId);
    const playedCard = player.hand!.splice(cardIndex, 1)[0];
    
    // 放入弃牌堆
    if (!state.deck!.discardPile) state.deck!.discardPile = [];
    state.deck!.discardPile.push(playedCard);
    
    // 检查是否所有玩家都出牌
    const allPlayersPlayed = state.players.every(p => !p.hand || p.hand.length === 0);
    if (allPlayersPlayed) {
      // 比较牌的大小并计分
      this.scoreRound(state);
      
      // 检查游戏是否结束
      const winner = this.checkRoundWinner(state);
      if (winner) {
        state.status = 'finished';
        state.phase = 'finished';
      } else {
        // 开始新回合
        this.startNewRound(state);
      }
    }
    
    return state;
  }

  private scoreRound(state: GameState): void {
    const playedCards = state.deck!.discardPile.slice(-state.players.length);
    
    // 找到最大的牌
    let highestCard = playedCards[0];
    let winner = state.players[0];
    
    for (let i = 1; i < playedCards.length; i++) {
      const card = playedCards[i];
      const player = state.players[i];
      
      if (this.compareCards(card, highestCard) > 0) {
        highestCard = card;
        winner = player;
      }
    }
    
    // 给获胜者加分
    winner.score++;
    state.score[winner.id] = winner.score;
  }

  private compareCards(card1: Card, card2: Card): number {
    const rank1 = this.getRankValue(card1.rank);
    const rank2 = this.getRankValue(card2.rank);
    
    if (rank1 > rank2) return 1;
    if (rank1 < rank2) return -1;
    
    // 如果大小相同，比较花色
    const suit1 = this.getSuitValue(card1.suit);
    const suit2 = this.getSuitValue(card2.suit);
    
    return suit1 - suit2;
  }

  private getRankValue(rank: CardRank): number {
    const rankValues: Record<CardRank, number> = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11,
      '10': 10, '9': 9, '8': 8, '7': 7, '6': 6,
      '5': 5, '4': 4, '3': 3, '2': 2
    };
    return rankValues[rank];
  }

  private getSuitValue(suit: CardSuit): number {
    const suitValues: Record<CardSuit, number> = {
      'spades': 4, 'hearts': 3, 'diamonds': 2, 'clubs': 1
    };
    return suitValues[suit];
  }

  private checkRoundWinner(state: GameState): string | null {
    for (const player of state.players) {
      if (player.score >= this.ROUNDS_TO_WIN) {
        return player.id;
      }
    }
    return null;
  }

  private startNewRound(state: GameState): void {
    state.round++;
    state.phase = 'dealing';
    state.currentPlayerIndex = 0;
    
    // 重新洗牌
    this.shuffleDeck(state.deck!);
  }

  private shuffleDeck(deck: CardDeck): void {
    // 将弃牌堆的牌放回牌组
    deck.cards.push(...deck.discardPile);
    deck.discardPile = [];
    
    // 洗牌
    for (let i = deck.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
    }
    
    deck.shuffled = true;
  }

  // === 胜利条件检查 ===

  checkWinCondition(state: GameState): WinResult | null {
    const winner = this.checkRoundWinner(state);
    
    if (winner) {
      const winnerPlayer = state.players.find(p => p.id === winner)!;
      return {
        winnerId: winner,
        isDraw: false,
        reason: `${winnerPlayer.name} 率先赢得 ${this.ROUNDS_TO_WIN} 局！`,
        finalScores: state.score
      };
    }
    
    return null;
  }

  // === 游戏逻辑 ===

  getValidActions(state: GameState, playerId: string): ActionType[] {
    if (state.status !== 'active') return [];
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return [];
    
    switch (state.phase) {
      case 'dealing':
        return ['draw'];
      case 'playing':
        return ['play'];
      default:
        return [];
    }
  }

  getNextPlayer(state: GameState): number {
    return (state.currentPlayerIndex + 1) % state.players.length;
  }

  calculateScore(state: GameState, playerId: string): number {
    return state.score[playerId] || 0;
  }
}

// === 工厂函数 ===

export function createCardCompareGame(): {
  rules: GameRules;
  initialState: Partial<GameState>;
} {
  const rules = new CardCompareRules();
  
  // 创建标准52张牌
  const cards: Card[] = [];
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      cards.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        isVisible: false,
        isPlayable: true
      });
    });
  });
  
  // 洗牌
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  const deck: CardDeck = {
    cards,
    discardPile: [],
    shuffled: true
  };

  const initialState: Partial<GameState> = {
    deck,
    phase: 'dealing'
  };

  return { rules, initialState };
}

// === AI策略 ===

export class CardCompareAI {
  // 简单AI：总是出最大的牌
  public getBestCard(state: GameState, playerId: string): string | null {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.hand || player.hand.length === 0) {
      return null;
    }
    
    // 找到手中最大的牌
    let bestCard = player.hand[0];
    for (const card of player.hand) {
      if (this.compareCards(card, bestCard) > 0) {
        bestCard = card;
      }
    }
    
    return bestCard.id;
  }
  
  private compareCards(card1: Card, card2: Card): number {
    const rank1 = this.getRankValue(card1.rank);
    const rank2 = this.getRankValue(card2.rank);
    return rank1 - rank2;
  }
  
  private getRankValue(rank: CardRank): number {
    const rankValues: Record<CardRank, number> = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11,
      '10': 10, '9': 9, '8': 8, '7': 7, '6': 6,
      '5': 5, '4': 4, '3': 3, '2': 2
    };
    return rankValues[rank];
  }
} 