// 🎯 AI游戏大师组件 - GM引导游戏流程

import React, { useState, useEffect } from 'react';
import { Player } from '../../types/common';
import { GameState } from '../../types/game';
import Button from '../ui/Button';
import Card from '../ui/Card';
import './AIGameMaster.css';

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: 'board' | 'card' | 'dice';
  rules: string;
}

interface AIGameMasterProps {
  gameTemplate: GameTemplate;
  gameState: GameState;
  currentPlayer: Player;
  onExpandChat?: () => void;
}

interface GameHint {
  type: 'reminder' | 'strategy' | 'rule' | 'score';
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

const AIGameMaster: React.FC<AIGameMasterProps> = ({
  gameTemplate,
  gameState,
  currentPlayer,
  onExpandChat
}) => {
  const [currentHint, setCurrentHint] = useState<GameHint | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // 根据游戏状态生成提示
  useEffect(() => {
    const generateHint = () => {
      const hints = getGameHints(gameTemplate, gameState, currentPlayer);
      if (hints.length > 0) {
        // 优先显示高优先级提示
        const highPriorityHints = hints.filter(h => h.priority === 'high');
        const selectedHint = highPriorityHints.length > 0 
          ? highPriorityHints[0] 
          : hints[0];
        
        setCurrentHint(selectedHint);
        setAnimationKey(prev => prev + 1);
      }
    };

    generateHint();
    
    // 定期更新提示
    const interval = setInterval(generateHint, 10000); // 每10秒检查一次
    return () => clearInterval(interval);
  }, [gameTemplate, gameState, currentPlayer]);

  // 生成游戏相关提示
  const getGameHints = (template: GameTemplate, state: GameState, player: Player): GameHint[] => {
    const hints: GameHint[] = [];
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === player.id;

    // 回合提醒
    if (isMyTurn) {
      hints.push({
        type: 'reminder',
        message: `轮到你了！现在是第${state.round}回合`,
        priority: 'high',
        timestamp: Date.now()
      });
    }

    // 游戏特定提示
    switch (template.id) {
      case 'gomoku':
        hints.push(...getGomokuHints(state, player));
        break;
      case 'card_compare':
        hints.push(...getCardGameHints(state, player));
        break;
      case 'dice_guess':
        hints.push(...getDiceGameHints(state, player));
        break;
    }

    // 分数提醒
    const playerScore = state.players.find(p => p.id === player.id)?.score || 0;
    const otherScores = state.players.filter(p => p.id !== player.id).map(p => p.score);
    const maxOtherScore = Math.max(...otherScores);
    
    if (playerScore > maxOtherScore) {
      hints.push({
        type: 'score',
        message: `你目前领先！当前分数：${playerScore}`,
        priority: 'medium',
        timestamp: Date.now()
      });
    } else if (playerScore < maxOtherScore) {
      hints.push({
        type: 'score',
        message: `加油追赶！当前分数：${playerScore}，需要追上${maxOtherScore - playerScore}分`,
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    return hints;
  };

  // 五子棋特定提示
  const getGomokuHints = (state: GameState, player: Player): GameHint[] => {
    const hints: GameHint[] = [];
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === player.id;

    if (isMyTurn) {
      hints.push({
        type: 'strategy',
        message: '寻找连成四子的机会，或阻止对手连五',
        priority: 'medium',
        timestamp: Date.now()
      });
    }

    return hints;
  };

  // 纸牌游戏特定提示
  const getCardGameHints = (state: GameState, player: Player): GameHint[] => {
    const hints: GameHint[] = [];
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === player.id;

    if (isMyTurn) {
      hints.push({
        type: 'reminder',
        message: '点击"抽牌"开始这一轮的比拼',
        priority: 'high',
        timestamp: Date.now()
      });
    }

    return hints;
  };

  // 骰子游戏特定提示
  const getDiceGameHints = (state: GameState, player: Player): GameHint[] => {
    const hints: GameHint[] = [];
    const isMyTurn = state.players[state.currentPlayerIndex]?.id === player.id;
    const playerData = state.players.find(p => p.id === player.id);

    if (isMyTurn && playerData) {
      if (playerData.score > 50) {
        hints.push({
          type: 'strategy',
          message: '筹码充足，可以考虑下大一些的赌注',
          priority: 'medium',
          timestamp: Date.now()
        });
      } else if (playerData.score < 20) {
        hints.push({
          type: 'strategy',
          message: '筹码不多了，建议保守下注',
          priority: 'high',
          timestamp: Date.now()
        });
      }
    }

    return hints;
  };

  // 获取提示图标
  const getHintIcon = (type: GameHint['type']) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'strategy': return '🎯';
      case 'rule': return '📖';
      case 'score': return '🏆';
      default: return '💡';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: GameHint['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  if (isMinimized) {
    return (
      <div className="ai-game-master ai-game-master--minimized">
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="ai-master-toggle"
        >
          🤖 AI助手
        </Button>
      </div>
    );
  }

  return (
    <div className="ai-game-master">
      <Card variant="elevated" className="ai-master-card">
        {/* 头部 */}
        <div className="ai-master-header">
          <div className="ai-master-avatar">
            <span className="ai-avatar-icon">🤖</span>
            <div className="ai-status-indicator"></div>
          </div>
          <div className="ai-master-info">
            <h4 className="ai-master-title">AI游戏大师</h4>
            <p className="ai-master-subtitle">为您引导游戏流程</p>
          </div>
          <div className="ai-master-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="ai-control-btn"
              title="最小化"
            >
              −
            </Button>
          </div>
        </div>

        {/* 当前提示 */}
        {currentHint && (
          <div className="ai-master-content" key={animationKey}>
            <div className={`ai-hint ai-hint--${getPriorityColor(currentHint.priority)}`}>
              <span className="ai-hint-icon">{getHintIcon(currentHint.type)}</span>
              <span className="ai-hint-message">{currentHint.message}</span>
            </div>
          </div>
        )}

        {/* 游戏状态总览 */}
        <div className="ai-master-status">
          <div className="game-status-item">
            <span className="status-label">当前回合</span>
            <span className="status-value">{gameState.round}</span>
          </div>
          <div className="game-status-item">
            <span className="status-label">游戏阶段</span>
            <span className="status-value">{getPhaseText(gameState.phase)}</span>
          </div>
          <div className="game-status-item">
            <span className="status-label">我的分数</span>
            <span className="status-value">
              {gameState.players.find(p => p.id === currentPlayer.id)?.score || 0}
            </span>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="ai-master-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={onExpandChat}
            className="ai-action-btn"
          >
            💬 详细对话
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 触发新提示
              setAnimationKey(prev => prev + 1);
            }}
            className="ai-action-btn"
          >
            💡 获取建议
          </Button>
        </div>
      </Card>
    </div>
  );
};

// 辅助函数
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
  return phases[phase || ''] || '进行中';
}

export default AIGameMaster; 