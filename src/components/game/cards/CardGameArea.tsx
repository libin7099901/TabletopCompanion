// 🃏 纸牌游戏区域组件

import React from 'react';
import { GameState, Card } from '../../../types/game';
import { Player } from '../../../types/common';
import Button from '../../ui/Button';
import './CardGameArea.css';

interface CardGameAreaProps {
  gameState: GameState;
  currentPlayer: Player;
  onDrawCard: () => void;
  onPlayCard: (cardId: string) => void;
}

const CardGameArea: React.FC<CardGameAreaProps> = ({
  gameState,
  currentPlayer,
  onDrawCard,
  onPlayCard
}) => {
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;
  const currentPlayerData = gameState.players.find(p => p.id === currentPlayer.id);
  const canDraw = gameState.phase === 'dealing' && isMyTurn;
  const canPlay = gameState.phase === 'playing' && isMyTurn && currentPlayerData?.hand?.length;

  const renderCard = (card: Card) => {
    return (
      <div
        key={card.id}
        className={`game-card ${card.isPlayable ? 'playable' : ''}`}
        onClick={() => canPlay && onPlayCard(card.id)}
      >
        <div className="card-content">
          <div className="card-rank">{card.rank}</div>
          <div className="card-suit">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>
    );
  };

  const renderPlayArea = () => {
    const lastPlayedCards = gameState.deck?.discardPile?.slice(-gameState.players.length) || [];
    
    return (
      <div className="play-area">
        <h4>本轮出牌</h4>
        <div className="played-cards">
          {lastPlayedCards.map((card, index) => (
            <div key={`${card.id}-played`} className="played-card">
              <div className="card-content">
                <div className="card-rank">{card.rank}</div>
                <div className="card-suit">{getSuitSymbol(card.suit)}</div>
              </div>
              <div className="player-label">
                {gameState.players[index]?.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="card-game-area">
      <div className="game-status">
        <div className="phase-info">
          阶段: {getPhaseText(gameState.phase)}
        </div>
        <div className="deck-info">
          剩余牌数: {gameState.deck?.cards.length || 0}
        </div>
      </div>

      {/* 发牌区域 */}
      {gameState.phase === 'dealing' && (
        <div className="dealing-area">
          <div className="deck-placeholder">
            <div className="deck-back">🂠</div>
            <div className="deck-label">牌组</div>
          </div>
          
          {canDraw && (
            <Button variant="primary" onClick={onDrawCard}>
              抽牌
            </Button>
          )}
          
          {!canDraw && isMyTurn && (
            <div className="waiting-message">等待其他玩家...</div>
          )}
        </div>
      )}

      {/* 出牌区域 */}
      {gameState.phase === 'playing' && renderPlayArea()}

      {/* 手牌区域 */}
      <div className="hand-area">
        <h4>我的手牌</h4>
        <div className="hand-cards">
          {currentPlayerData?.hand?.map(card => renderCard(card)) || (
            <div className="no-cards">暂无手牌</div>
          )}
        </div>
        
        {canPlay && (
          <div className="play-instruction">
            点击卡牌出牌
          </div>
        )}
      </div>

      {/* 玩家状态 */}
      <div className="players-status">
        {gameState.players.map(player => (
          <div 
            key={player.id} 
            className={`player-status ${player.isActive ? 'active' : ''}`}
          >
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              <span className="hand-count">
                手牌: {player.hand?.length || 0}
              </span>
              <span className="score">分数: {player.score}</span>
            </div>
            {player.isActive && <div className="turn-indicator">轮到此玩家</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

// 辅助函数
function getSuitSymbol(suit: string): string {
  const symbols: Record<string, string> = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
  };
  return symbols[suit] || suit;
}

function getPhaseText(phase: string): string {
  const phases: Record<string, string> = {
    'dealing': '发牌中',
    'playing': '出牌中',
    'scoring': '计分中',
    'finished': '已结束'
  };
  return phases[phase] || phase;
}

export default CardGameArea; 