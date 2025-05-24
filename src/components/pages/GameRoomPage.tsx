import React, { useState, useEffect, lazy } from 'react';
import { GameRoom, GameTemplate } from '../../store/roomStore';
import { Player } from '../../types/common';
import AIChatPanel from '../ai/AIChatPanel';
import './GameRoomPage.css';

interface GameRoomPageProps {
  room: GameRoom;
  currentPlayer: Player;
  templates: GameTemplate[];
  onSelectTemplate: (templateId: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onInvitePlayer: () => void;
  onBack: () => void;
}

type RoomView = 'lobby' | 'template-select' | 'game';

const GameRoomPage: React.FC<GameRoomPageProps> = ({
  room,
  currentPlayer,
  templates,
  onSelectTemplate,
  onStartGame,
  onLeaveRoom,
  onInvitePlayer,
  onBack
}) => {
  const [currentView, setCurrentView] = useState<RoomView>('lobby');
  const [showAIChat, setShowAIChat] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
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
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  if (currentView === 'template-select') {
    return (
      <div className="game-room-page" data-testid="game-room-page">
        {/* 🧭 导航栏 */}
        <nav className="main-navbar">
          <div className="navbar-brand">
            <div className="navbar-logo">🎲</div>
            <span className="navbar-app-name">桌游伴侣</span>
          </div>
          
          <div className="navbar-user">
            <div className="user-avatar">{currentPlayer.name.charAt(0).toUpperCase()}</div>
            <span className="user-name">{currentPlayer.name}</span>
          </div>
        </nav>

        <div className="page-container">
          {/* 🏠 面包屑导航 */}
          <div className="breadcrumb-nav">
            <button className="breadcrumb-item" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/>
              </svg>
              <span>主页</span>
            </button>
            <span className="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <button className="breadcrumb-item" onClick={() => setCurrentView('lobby')}>
              房间 {room.id}
            </button>
            <span className="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <span className="breadcrumb-current">选择游戏</span>
          </div>

          {/* 🎯 页面头部 */}
          <div className="page-header">
            <h1 className="page-title">选择游戏模板</h1>
            <p className="page-subtitle">
              为房间 "{room.name}" 选择一个游戏模板开始游戏
            </p>
          </div>

          {/* 🎮 模板选择网格 */}
          <div className="template-selection-section">
            <div className="templates-grid">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${room.gameTemplate?.id === template.id ? 'template-card--selected' : ''}`}
                  onClick={() => handleTemplateSelect(template.id)}
                  data-testid={`template-${template.id}`}
                >
                  <div className="template-header">
                    <div className="template-type-badge">
                      <span className="type-icon">{getTypeIcon(template.type)}</span>
                      <span>{getTypeName(template.type)}</span>
                    </div>
                    <div className={`difficulty-badge difficulty--${template.difficulty}`}>
                      {getDifficultyName(template.difficulty)}
                    </div>
                    {room.gameTemplate?.id === template.id && (
                      <div className="current-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        当前选择
                      </div>
                    )}
                  </div>
                  
                  <div className="template-content">
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
                  </div>

                  <div className="template-action">
                    <span className="action-text">
                      {room.gameTemplate?.id === template.id ? '已选择' : '选择此游戏'}
                    </span>
                    <span className="action-arrow">→</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 操作按钮 */}
            <div className="template-actions">
              <button 
                className="btn btn--outline btn--lg"
                onClick={() => setCurrentView('lobby')}
              >
                返回房间
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'game') {
    // 导入GameInterface组件
    const GameInterface = lazy(() => import('../game/GameInterface'));
    
    return (
      <div className="game-room-page game-playing">
        <div className="game-container">
          <React.Suspense fallback={
            <div className="game-loading">
              <div className="loading-spinner"></div>
              <p>正在加载游戏界面...</p>
            </div>
          }>
            <GameInterface
              templateId={room.gameTemplate!.id}
              players={room.players}
              currentPlayer={currentPlayer}
              onGameEnd={(result) => {
                console.log('Game ended:', result);
                setCurrentView('lobby');
              }}
              onBack={() => setCurrentView('lobby')}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="game-room-page">
      {/* 🧭 导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎲</div>
          <span className="navbar-app-name">桌游伴侣</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-avatar">{currentPlayer.name.charAt(0).toUpperCase()}</div>
          <span className="user-name">{currentPlayer.name}</span>
        </div>
      </nav>

      <div className="page-container">
        {/* 🏠 面包屑导航 */}
        <div className="breadcrumb-nav">
          <button className="breadcrumb-item" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z"/>
            </svg>
            <span>主页</span>
          </button>
          <span className="breadcrumb-separator">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </span>
          <span className="breadcrumb-current">房间 {room.id}</span>
        </div>

        {/* 🎯 页面头部 */}
        <div className="page-header">
          <div className="room-header-content">
            <div className="room-title-section">
              <h1 className="page-title">{room.name}</h1>
              <div className="room-meta">
                <div className="room-id-display">
                  <span className="room-id-label">房间ID：</span>
                  <button 
                    className={`room-id-button ${copySuccess ? 'copied' : ''}`}
                    onClick={copyRoomId}
                    data-testid="copy-room-id"
                  >
                    {room.id}
                    <span className="copy-icon">
                      {copySuccess ? '✓' : '📋'}
                    </span>
                  </button>
                  {copySuccess && <span className="copy-toast">已复制！</span>}
                </div>
                <div className="room-status-info">
                  <div className={`status-badge status--${room.status}`}>
                    <span className="status-indicator"></span>
                    {getStatusName(room.status)}
                  </div>
                  <span className="player-count-info">
                    {room.players.length}/{room.maxPlayers} 玩家
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🏠 房间主体布局 */}
        <div className="room-layout">
          {/* 左侧：房间控制面板 */}
          <div className="room-sidebar">
            {/* 游戏模板信息 */}
            <div className="game-template-section">
              {room.gameTemplate ? (
                <div className="current-template-card">
                  <div className="template-header-info">
                    <h3 className="section-title">当前游戏</h3>
                    {isHost && (
                      <button 
                        className="btn btn--outline btn--sm"
                        onClick={() => setCurrentView('template-select')}
                        data-testid="change-template-btn"
                      >
                        切换游戏
                      </button>
                    )}
                  </div>
                  
                  <div className="template-display">
                    <div className="template-icon-display">
                      {getTypeIcon(room.gameTemplate.type)}
                    </div>
                    <div className="template-info">
                      <h4 className="template-name">{room.gameTemplate.name}</h4>
                      <div className="template-details">
                        <span className="detail-item">
                          <span className="detail-icon">👥</span>
                          {room.gameTemplate.minPlayers}-{room.gameTemplate.maxPlayers}人
                        </span>
                        <span className="detail-item">
                          <span className="detail-icon">⏱️</span>
                          {room.gameTemplate.estimatedTime}分钟
                        </span>
                        <span className="detail-item">
                          <span className="detail-icon">🎯</span>
                          {getDifficultyName(room.gameTemplate.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-template-card">
                  <div className="no-template-content">
                    <div className="no-template-icon">🎮</div>
                    <h3>尚未选择游戏</h3>
                    <p>请选择一个游戏模板来开始游戏</p>
                    {isHost && (
                      <button 
                        className="btn btn--primary btn--sm"
                        onClick={() => setCurrentView('template-select')}
                        data-testid="select-template-btn"
                      >
                        选择游戏
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 房间操作 */}
            <div className="room-actions-section">
              <h3 className="section-title">房间操作</h3>
              
              <div className="actions-group">
                {isHost && canStart && (
                  <button 
                    className="btn btn--primary btn--lg action-btn start-game-btn"
                    onClick={onStartGame}
                    data-testid="start-game-btn"
                  >
                    <span className="btn-icon">🚀</span>
                    开始游戏
                  </button>
                )}

                <button 
                  className="btn btn--secondary btn--lg action-btn"
                  onClick={onInvitePlayer}
                  data-testid="invite-player-btn"
                >
                  <span className="btn-icon">👥</span>
                  邀请玩家
                </button>

                <button 
                  className="btn btn--outline btn--lg action-btn"
                  onClick={onLeaveRoom}
                  data-testid="leave-room-btn"
                >
                  <span className="btn-icon">🚪</span>
                  离开房间
                </button>
              </div>
            </div>

            {/* AI助手按钮 */}
            <div className="ai-section">
              <button 
                className={`ai-toggle-btn ${showAIChat ? 'active' : ''}`}
                onClick={() => setShowAIChat(!showAIChat)}
                data-testid="ai-chat-toggle"
              >
                <span className="ai-icon">🤖</span>
                <span className="ai-text">AI游戏助手</span>
                <span className="ai-status">{showAIChat ? '已开启' : '点击开启'}</span>
              </button>
            </div>
          </div>

          {/* 右侧：玩家列表和活动 */}
          <div className="room-main">
            {/* 玩家列表 */}
            <div className="players-section">
              <h3 className="section-title">
                玩家列表 
                <span className="player-count-badge">
                  {room.players.length}/{room.maxPlayers}
                </span>
              </h3>
              
              <div className="players-grid">
                {room.players.map((player) => (
                  <div 
                    key={player.id} 
                    className={`player-card ${player.id === currentPlayer.id ? 'player-card--self' : ''}`}
                    data-testid={`player-${player.id}`}
                  >
                    <div className="player-avatar">
                      {player.avatar || '👤'}
                    </div>
                    <div className="player-info">
                      <span className="player-name">{player.name}</span>
                      <div className="player-badges">
                        {player.id === room.hostId && (
                          <span className="badge badge--host">房主</span>
                        )}
                        {player.id === currentPlayer.id && (
                          <span className="badge badge--self">我</span>
                        )}
                      </div>
                    </div>
                    <div className="player-status">
                      <div className="status-dot status--online"></div>
                      <span className="status-text">在线</span>
                    </div>
                  </div>
                ))}
                
                {/* 空位显示 */}
                {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="player-card player-card--empty">
                    <div className="player-avatar player-avatar--empty">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                      </svg>
                    </div>
                    <div className="player-info">
                      <span className="player-name">等待玩家加入...</span>
                    </div>
                    <div className="player-status">
                      <div className="status-dot status--offline"></div>
                      <span className="status-text">空位</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 房间活动 */}
            <div className="activity-section">
              <h3 className="section-title">房间活动</h3>
              
              <div className="activity-feed">
                <div className="activity-item">
                  <div className="activity-avatar">
                    {currentPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">
                      <strong>{currentPlayer.name}</strong> 加入了房间
                    </span>
                    <span className="activity-time">刚刚</span>
                  </div>
                </div>
                
                {room.gameTemplate && (
                  <div className="activity-item">
                    <div className="activity-avatar activity-avatar--system">
                      🎮
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">
                        房主选择了游戏: <strong>{room.gameTemplate.name}</strong>
                      </span>
                      <span className="activity-time">1分钟前</span>
                    </div>
                  </div>
                )}

                <div className="activity-item">
                  <div className="activity-avatar activity-avatar--system">
                    🏠
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">
                      房间 "{room.name}" 已创建
                    </span>
                    <span className="activity-time">2分钟前</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI聊天面板 */}
      <AIChatPanel
        currentPlayer={currentPlayer}
        gameTemplate={room.gameTemplate as any}
        gameState={undefined}
        isVisible={showAIChat}
        onToggle={() => setShowAIChat(!showAIChat)}
      />
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