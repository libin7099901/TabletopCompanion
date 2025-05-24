// 🎮 通用游戏界面组件

import React, { useState, useEffect } from 'react';
import { GameState, ActionType } from '../../types/game';
import { GameEngine, createAction } from '../../services/GameEngine';
import { Player } from '../../types/common';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AIChatPanel from '../ai/AIChatPanel';
import AIGameMaster from '../ai/AIGameMaster';
import './GameInterface.css';

// 游戏专用组件
import GomokuBoard from './boards/GomokuBoard';
import CardGameArea from './cards/CardGameArea';
import DiceGameArea from './dice/DiceGameArea';

interface GameInterfaceProps {
  templateId: string;
  players: Player[];
  currentPlayer: Player;
  onGameEnd: (result: any) => void;
  onBack: () => void;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  templateId,
  players,
  currentPlayer,
  onGameEnd,
  onBack
}) => {
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [gameTemplate, setGameTemplate] = useState<any>(null);

  // 初始化游戏
  useEffect(() => {
    initializeGame();
  }, [templateId, players]);

  const initializeGame = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 动态导入游戏模板
      let gameConfig;
      let templateInfo;
      
      switch (templateId) {
        case 'gomoku':
          const { createGomokuGame } = await import('../../games/GomokuGame');
          gameConfig = createGomokuGame();
          templateInfo = {
            id: 'gomoku',
            name: '五子棋',
            description: '经典的策略游戏，率先在棋盘上连成5个棋子即获胜',
            type: 'board' as const,
            rules: '轮流下棋，黑子先行，横、竖、斜任意方向连成5子即获胜'
          };
          break;
        case 'card_compare':
          const { createCardCompareGame } = await import('../../games/CardCompareGame');
          gameConfig = createCardCompareGame();
          templateInfo = {
            id: 'card_compare',
            name: '比大小',
            description: '简单刺激的纸牌游戏，比较牌面大小',
            type: 'card' as const,
            rules: '每轮每人抽一张牌比大小，A最大，2最小，花色：黑桃>红心>方块>梅花'
          };
          break;
        case 'dice_guess':
          const { createDiceGuessGame } = await import('../../games/DiceGuessGame');
          gameConfig = createDiceGuessGame();
          templateInfo = {
            id: 'dice_guess',
            name: '猜大小',
            description: '经典的骰子游戏，猜测3个骰子总点数大小',
            type: 'dice' as const,
            rules: '使用3个骰子，猜测总点数大小(11-18为大，3-10为小)，猜中获得双倍奖金'
          };
          break;
        default:
          throw new Error(`Unknown template: ${templateId}`);
      }

      // 设置游戏模板信息
      setGameTemplate(templateInfo);

      // 初始化玩家分数
      const initializedPlayers = players.map(player => ({
        ...player,
        score: getInitialScore(templateId)
      }));

      // 创建游戏引擎
      const engine = new GameEngine(templateId, initializedPlayers, gameConfig.rules, {
        difficulty: 'medium',
        allowUndo: true,
        showHints: true
      });

      // 设置事件监听器
      engine.addEventListener(handleGameEvent);

      // 启动游戏
      engine.startGame();
      
      setGameEngine(engine);
      setGameState(engine.getGameState());
      setIsLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : '游戏初始化失败');
      setIsLoading(false);
    }
  };

  const getInitialScore = (templateId: string): number => {
    switch (templateId) {
      case 'dice_guess':
        return 100; // 初始筹码
      default:
        return 0;
    }
  };

  const handleGameEvent = (event: string, data: any) => {
    console.log('Game event:', event, data);
    
    switch (event) {
      case 'gameStarted':
      case 'actionExecuted':
      case 'turnChanged':
        if (gameEngine) {
          setGameState(gameEngine.getGameState());
        }
        break;
      
      case 'gameEnded':
        onGameEnd(data);
        break;
      
      case 'actionRejected':
        console.warn('Action rejected:', data.reason);
        break;
    }
  };

  const executeAction = (type: ActionType, data?: any) => {
    if (!gameEngine || !gameState) return;

    const action = createAction(currentPlayer.id, type, data);
    gameEngine.executeAction(action);
  };

  const handleUndo = () => {
    if (gameEngine) {
      gameEngine.undoLastAction();
    }
  };

  const handlePause = () => {
    if (gameEngine) {
      gameEngine.pauseGame();
    }
  };

  const renderGameContent = () => {
    if (!gameState) return null;

    switch (templateId) {
      case 'gomoku':
        return (
          <GomokuBoard
            gameState={gameState}
            currentPlayer={currentPlayer}
            onPlacePiece={(x, y) => executeAction('place', { x, y })}
          />
        );
      
      case 'card_compare':
        return (
          <CardGameArea
            gameState={gameState}
            currentPlayer={currentPlayer}
            onDrawCard={() => executeAction('draw')}
            onPlayCard={(cardId) => executeAction('play', cardId)}
          />
        );
      
      case 'dice_guess':
        return (
          <DiceGameArea
            gameState={gameState}
            currentPlayer={currentPlayer}
            onPlaceBet={(guess, amount) => executeAction('bet', { guess, amount })}
            onRollDice={() => executeAction('roll')}
          />
        );
      
      default:
        return (
          <div className="game-placeholder">
            <p>该游戏模板正在开发中...</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="game-interface game-loading">
        <Card variant="elevated" padding="xl" className="loading-card">
          <div className="loading-content">
            <div className="loading-icon">🎮</div>
            <h3>正在加载游戏...</h3>
            <p>请稍候，正在初始化游戏环境</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-interface game-error">
        <Card variant="elevated" padding="xl" className="error-card">
          <div className="error-content">
            <div className="error-icon">❌</div>
            <h3>游戏加载失败</h3>
            <p>{error}</p>
            <div className="error-actions">
              <Button variant="primary" onClick={initializeGame}>
                重试
              </Button>
              <Button variant="outline" onClick={onBack}>
                返回房间
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="game-interface">
      {/* 游戏头部 */}
      <div className="game-header">
        <div className="game-info">
          <h2 className="game-title">{getGameTitle(templateId)}</h2>
          <div className="game-status">
            <span className="round-info">第 {gameState?.round} 回合</span>
            <span className="phase-info">{getPhaseText(gameState?.phase)}</span>
          </div>
        </div>
        
        <div className="game-controls">
          {gameState?.settings.allowUndo && (
            <Button variant="outline" size="sm" onClick={handleUndo}>
              撤销
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePause}>
            暂停
          </Button>
          <Button variant="secondary" size="sm" onClick={onBack}>
            退出游戏
          </Button>
        </div>
      </div>

      {/* 玩家信息栏 */}
      <div className="players-bar">
        {gameState?.players.map((player, _index) => (
          <div
            key={player.id}
            className={`player-info ${player.isActive ? 'player-active' : ''} ${
              player.id === currentPlayer.id ? 'player-self' : ''
            }`}
          >
            <div className="player-avatar">
              {player.avatar || '👤'}
            </div>
            <div className="player-details">
              <span className="player-name">{player.name}</span>
              <span className="player-score">分数: {player.score}</span>
            </div>
            {player.isActive && <div className="turn-indicator">当前回合</div>}
          </div>
        ))}
      </div>

      {/* 游戏主要内容 */}
      <div className="game-content">
        {renderGameContent()}
      </div>

      {/* 游戏底部信息 */}
      <div className="game-footer">
        <div className="current-player">
          当前玩家: {gameState?.players[gameState.currentPlayerIndex]?.name}
        </div>
        {gameState?.settings.timeLimit && (
          <div className="time-limit">
            回合时限: {gameState.settings.timeLimit}秒
          </div>
        )}
      </div>

      {/* AI聊天面板 */}
      <AIChatPanel
        currentPlayer={currentPlayer}
        gameTemplate={gameTemplate}
        gameState={gameState || undefined}
        isVisible={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
      />

      {/* AI游戏大师 - 持久显示 */}
      {gameTemplate && gameState && (
        <AIGameMaster
          gameTemplate={gameTemplate}
          gameState={gameState}
          currentPlayer={currentPlayer}
          onExpandChat={() => setShowAIChat(true)}
        />
      )}
    </div>
  );
};

// 辅助函数
function getGameTitle(templateId: string): string {
  const titles: Record<string, string> = {
    'gomoku': '五子棋',
    'card_compare': '比大小',
    'dice_guess': '猜大小',
    'rock_paper_scissors': '石头剪刀布'
  };
  return titles[templateId] || '未知游戏';
}

function getPhaseText(phase?: string): string {
  const phases: Record<string, string> = {
    'setup': '准备中',
    'dealing': '发牌中',
    'playing': '游戏中',
    'betting': '下注中',
    'rolling': '掷骰子',
    'revealing': '翻牌中',
    'scoring': '计分中',
    'finished': '已结束'
  };
  return phases[phase || ''] || '';
}

export default GameInterface; 