// 🎲 骰子游戏区域组件

import React, { useState } from 'react';
import { GameState } from '../../../types/game';
import { Player } from '../../../types/common';
import Button from '../../ui/Button';
import './DiceGameArea.css';

interface DiceGameAreaProps {
  gameState: GameState;
  currentPlayer: Player;
  onPlaceBet: (guess: 'big' | 'small', amount: number) => void;
  onRollDice: () => void;
}

const DiceGameArea: React.FC<DiceGameAreaProps> = ({
  gameState,
  currentPlayer,
  onPlaceBet,
  onRollDice
}) => {
  const [betGuess, setBetGuess] = useState<'big' | 'small'>('big');
  const [betAmount, setBetAmount] = useState(10);
  
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;
  const currentPlayerData = gameState.players.find(p => p.id === currentPlayer.id);
  const canBet = gameState.phase === 'betting' && !hasPlayerBet();
  const canRoll = gameState.phase === 'rolling' && isMyTurn;

  function hasPlayerBet(): boolean {
    return gameState.history.some(h => h.playerId === currentPlayer.id && h.type === 'bet');
  }

  const handleBetSubmit = () => {
    if (canBet && betAmount <= (currentPlayerData?.score || 0)) {
      onPlaceBet(betGuess, betAmount);
    }
  };

  const renderDice = () => {
    if (!gameState.dice) return null;

    return (
      <div className="dice-container">
        {gameState.dice.dice.map((die, _index) => (
          <div key={_index} className="die">
            <div className={`die-face ${die.value ? 'rolled' : 'unrolled'}`}>
              {die.value ? getDotPattern(die.value) : '?'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBettingArea = () => {
    if (gameState.phase !== 'betting') return null;

    return (
      <div className="betting-area">
        <h4>下注区域</h4>
        
        <div className="bet-options">
          <div className="guess-selection">
            <label>
              <input
                type="radio"
                value="big"
                checked={betGuess === 'big'}
                onChange={(e) => setBetGuess(e.target.value as 'big')}
                disabled={!canBet}
              />
              大 (11-18)
            </label>
            <label>
              <input
                type="radio"
                value="small"
                checked={betGuess === 'small'}
                onChange={(e) => setBetGuess(e.target.value as 'small')}
                disabled={!canBet}
              />
              小 (3-10)
            </label>
          </div>

          <div className="amount-selection">
            <label>下注金额:</label>
            <input
              type="number"
              min="1"
              max={currentPlayerData?.score || 0}
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={!canBet}
            />
            <span className="max-chips">/ {currentPlayerData?.score || 0} 筹码</span>
          </div>

          {canBet && (
            <Button variant="primary" onClick={handleBetSubmit}>
              确认下注
            </Button>
          )}

          {hasPlayerBet() && (
            <div className="bet-placed">
              已下注，等待其他玩家...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!gameState.dice || gameState.phase === 'betting') return null;

    const total = gameState.dice.dice.reduce((sum, die) => sum + (die.value || 0), 0);
    const result = total >= 11 ? 'big' : 'small';

    return (
      <div className="result-area">
        <h4>结果</h4>
        <div className="dice-total">
          总点数: {total}
        </div>
        <div className={`result ${result}`}>
          {result === 'big' ? '大' : '小'} ({total >= 11 ? '11-18' : '3-10'})
        </div>
      </div>
    );
  };

  const renderPlayerBets = () => {
    const betActions = gameState.history.filter(h => h.type === 'bet');
    
    if (betActions.length === 0) return null;

    return (
      <div className="player-bets">
        <h4>玩家下注</h4>
        <div className="bets-list">
          {betActions.map(bet => {
            const player = gameState.players.find(p => p.id === bet.data.playerId);
            return (
              <div key={bet.id} className="bet-item">
                <span className="player-name">{player?.name}</span>
                <span className="bet-guess">{bet.data.guess === 'big' ? '大' : '小'}</span>
                <span className="bet-amount">{bet.data.amount} 筹码</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dice-game-area">
      <div className="game-status">
        <div className="phase-info">
          阶段: {getPhaseText(gameState.phase)}
        </div>
        <div className="round-info">
          第 {gameState.round} 回合
        </div>
      </div>

      {/* 骰子显示区域 */}
      <div className="dice-display">
        <h4>骰子</h4>
        {renderDice()}
        
        {canRoll && (
          <Button variant="primary" onClick={onRollDice}>
            掷骰子
          </Button>
        )}
      </div>

      {/* 下注区域 */}
      {renderBettingArea()}

      {/* 结果显示 */}
      {renderResult()}

      {/* 玩家下注情况 */}
      {renderPlayerBets()}

      {/* 玩家筹码状态 */}
      <div className="players-chips">
        <h4>玩家筹码</h4>
        {gameState.players.map(player => (
          <div key={player.id} className="player-chips">
            <span className="player-name">{player.name}</span>
            <span className="chips-amount">{player.score} 筹码</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 辅助函数
function getDotPattern(value: number): string {
  const patterns: Record<number, string> = {
    1: '⚀',
    2: '⚁', 
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
  };
  return patterns[value] || value.toString();
}

function getPhaseText(phase: string): string {
  const phases: Record<string, string> = {
    'betting': '下注中',
    'rolling': '掷骰子',
    'scoring': '计分中',
    'finished': '已结束'
  };
  return phases[phase] || phase;
}

export default DiceGameArea; 