import React, { useState, useEffect } from 'react';
import { GameRoom, GameTemplate } from '../../store/roomStore';
import { Player } from '../../types/common';
import Button from '../ui/Button';
import Card from '../ui/Card';
import './GameRoomPage.css';

interface GameRoomPageProps {
  room: GameRoom;
  currentPlayer: Player;
  templates: GameTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onInvitePlayer: () => void;
}

type RoomView = 'lobby' | 'template-select' | 'game';

const GameRoomPage: React.FC<GameRoomPageProps> = ({
  room,
  currentPlayer,
  templates,
  onSelectTemplate,
  onStartGame,
  onLeaveRoom,
  onInvitePlayer
}) => {
  const [currentView, setCurrentView] = useState<RoomView>('lobby');
  
  const isHost = room.hostId === currentPlayer.id;
  const canStart = room.gameTemplate && room.players.length >= (room.gameTemplate.minPlayers || 2);

  useEffect(() => {
    if (room.status === 'playing') {
      setCurrentView('game');
    } else if (room.gameTemplate) {
      setCurrentView('lobby');
    }
  }, [room.status, room.gameTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    onSelectTemplate(templateId);
    setCurrentView('lobby');
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      // 这里可以添加一个toast通知
      alert('房间ID已复制到剪贴板！');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (currentView === 'template-select') {
    return (
      <div className="game-room-page">
        <div className="room-header">
          <div className="room-info">
            <h1 className="room-title">选择游戏模板</h1>
            <p className="room-subtitle">为房间选择一个游戏模板开始游戏</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('lobby')}>
            返回房间
          </Button>
        </div>

        <div className="template-grid">
          <div className="grid grid--cols-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                variant="elevated"
                hoverable
                clickable
                onClick={() => handleTemplateSelect(template.id)}
                className={`template-card ${room.gameTemplate?.id === template.id ? 'template-card--selected' : ''}`}
              >
                <div className="template-header">
                  <div className="template-type-badge">
                    {getTypeIcon(template.type)} {getTypeName(template.type)}
                  </div>
                  <div className="difficulty-badge difficulty--${template.difficulty}">
                    {getDifficultyName(template.difficulty)}
                  </div>
                  {room.gameTemplate?.id === template.id && (
                    <div className="current-badge">当前选择</div>
                  )}
                </div>
                
                <h3 className="template-title">{template.name}</h3>
                <p className="template-description">{template.description}</p>
                
                <div className="template-meta">
                  <div className="meta-item">
                    <span className="meta-icon">👥</span>
                    <span>{template.minPlayers}-{template.maxPlayers}人</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">⏱️</span>
                    <span>{template.estimatedTime}分钟</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'game') {
    return (
      <div className="game-room-page game-playing">
        <div className="game-container">
          <div className="game-header">
            <h1>{room.gameTemplate?.name}</h1>
            <Button variant="outline" onClick={() => setCurrentView('lobby')}>
              暂停游戏
            </Button>
          </div>
          
          <div className="game-area">
            <Card variant="elevated" padding="lg" className="game-board">
              <div className="game-placeholder">
                <div className="game-icon">🎮</div>
                <h3>游戏进行中</h3>
                <p>这里将显示具体的游戏界面</p>
                <p className="game-template-info">
                  当前游戏: {room.gameTemplate?.name}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-room-page">
      <div className="room-layout">
        {/* 左侧: 房间信息和控制 */}
        <div className="room-sidebar">
          <Card variant="elevated" padding="lg" className="room-info-card">
            <div className="room-header-info">
              <h2 className="room-name">{room.name}</h2>
              <div className="room-id-container">
                <span className="room-id-label">房间ID:</span>
                <button className="room-id-btn" onClick={copyRoomId}>
                  {room.id}
                  <span className="copy-icon">📋</span>
                </button>
              </div>
            </div>

            <div className="room-status">
              <div className="status-badge status--${room.status}">
                {getStatusName(room.status)}
              </div>
              <span className="player-count">
                {room.players.length}/{room.maxPlayers} 玩家
              </span>
            </div>

            {/* 游戏模板信息 */}
            {room.gameTemplate ? (
              <div className="current-template">
                <h4>当前游戏</h4>
                <div className="template-summary">
                  <div className="template-icon">
                    {getTypeIcon(room.gameTemplate.type)}
                  </div>
                  <div className="template-details">
                    <span className="template-name">{room.gameTemplate.name}</span>
                    <span className="template-meta-text">
                      {room.gameTemplate.minPlayers}-{room.gameTemplate.maxPlayers}人 • 
                      {room.gameTemplate.estimatedTime}分钟
                    </span>
                  </div>
                </div>
                {/* 添加切换模板功能 */}
                {isHost && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentView('template-select')}
                    className="change-template-btn"
                  >
                    切换游戏
                  </Button>
                )}
              </div>
            ) : (
              <div className="no-template">
                <p>尚未选择游戏模板</p>
                {isHost && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => setCurrentView('template-select')}
                  >
                    选择游戏
                  </Button>
                )}
              </div>
            )}

            {/* 房间操作 - 移除重复的模板选择按钮 */}
            <div className="room-actions">
              {isHost && canStart && (
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={onStartGame}
                >
                  开始游戏
                </Button>
              )}

              <div className="action-row">
                <Button variant="secondary" onClick={onInvitePlayer}>
                  邀请玩家
                </Button>
                <Button variant="outline" onClick={onLeaveRoom}>
                  离开房间
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* 中间: 玩家列表 */}
        <div className="room-main">
          <Card variant="elevated" padding="lg" className="players-card">
            <h3 className="players-title">玩家列表</h3>
            
            <div className="players-grid">
              {room.players.map((player) => (
                <div key={player.id} className="player-item">
                  <div className="player-avatar">
                    {player.avatar || '👤'}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    {player.id === room.hostId && (
                      <span className="host-badge">房主</span>
                    )}
                    {player.id === currentPlayer.id && (
                      <span className="self-badge">我</span>
                    )}
                  </div>
                  <div className="player-status">
                    <div className="status-indicator status--online"></div>
                  </div>
                </div>
              ))}
              
              {/* 空位显示 */}
              {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
                <div key={`empty-${index}`} className="player-item player-item--empty">
                  <div className="player-avatar player-avatar--empty">➕</div>
                  <div className="player-info">
                    <span className="player-name">等待玩家加入...</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 房间活动/聊天区域 */}
          <Card variant="elevated" padding="lg" className="activity-card">
            <h3 className="activity-title">房间活动</h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-time">刚刚</span>
                <span className="activity-text">{currentPlayer.name} 加入了房间</span>
              </div>
              {room.gameTemplate && (
                <div className="activity-item">
                  <span className="activity-time">1分钟前</span>
                  <span className="activity-text">
                    房主选择了游戏: {room.gameTemplate.name}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// 工具函数
function getTypeIcon(type: string): string {
  const icons = {
    card: '🃏',
    board: '♟️',
    dice: '🎲',
    custom: '🎨'
  };
  return icons[type as keyof typeof icons] || '🎮';
}

function getTypeName(type: string): string {
  const names = {
    card: '卡牌',
    board: '棋盘',
    dice: '骰子',
    custom: '自定义'
  };
  return names[type as keyof typeof names] || '游戏';
}

function getDifficultyName(difficulty: string): string {
  const names = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };
  return names[difficulty as keyof typeof names] || difficulty;
}

function getStatusName(status: string): string {
  const names = {
    waiting: '等待中',
    starting: '准备开始',
    playing: '游戏中',
    paused: '已暂停',
    finished: '已结束',
    closed: '已关闭'
  };
  return names[status as keyof typeof names] || status;
}

export default GameRoomPage; 