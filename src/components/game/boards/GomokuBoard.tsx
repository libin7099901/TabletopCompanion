// ♟️ 五子棋棋盘组件

import React from 'react';
import { GameState } from '../../../types/game';
import { Player } from '../../../types/common';
import './GomokuBoard.css';

interface GomokuBoardProps {
  gameState: GameState;
  currentPlayer: Player;
  onPlacePiece: (x: number, y: number) => void;
}

const GomokuBoard: React.FC<GomokuBoardProps> = ({
  gameState,
  currentPlayer,
  onPlacePiece
}) => {
  const boardSize = 15;
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

  const handleCellClick = (x: number, y: number) => {
    if (!isMyTurn || gameState.status !== 'active') return;
    
    // 检查位置是否为空
    if (gameState.board?.cells[y][x].piece) return;
    
    onPlacePiece(x, y);
  };

  const getPieceAt = (x: number, y: number) => {
    return gameState.board?.cells[y][x].piece;
  };

  const renderCell = (x: number, y: number) => {
    const piece = getPieceAt(x, y);
    const isPlayerPiece = piece?.playerId === currentPlayer.id;
    const cellKey = `${x}-${y}`;
    
    return (
      <div
        key={cellKey}
        className={`gomoku-cell ${piece ? 'has-piece' : ''} ${isMyTurn ? 'clickable' : ''}`}
        onClick={() => handleCellClick(x, y)}
      >
        {piece && (
          <div 
            className={`piece ${isPlayerPiece ? 'my-piece' : 'opponent-piece'}`}
          >
            {isPlayerPiece ? '●' : '○'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="gomoku-board-container">
      <div className="game-status">
        <div className="turn-info">
          {isMyTurn ? '你的回合' : `等待 ${gameState.players[gameState.currentPlayerIndex]?.name}`}
        </div>
        <div className="round-info">
          第 {gameState.round} 回合
        </div>
      </div>
      
      <div className="gomoku-board">
        {Array.from({ length: boardSize }).map((_, y) => (
          <div key={y} className="board-row">
            {Array.from({ length: boardSize }).map((_, x) => renderCell(x, y))}
          </div>
        ))}
      </div>

      <div className="game-info">
        <div className="players-score">
          {gameState.players.map(player => (
            <div key={player.id} className="player-score">
              <span className="player-name">{player.name}</span>
              <span className="score">{player.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GomokuBoard; 