import React, { useState } from 'react';
import { Player } from '../../types/common';
import './GameStartPage.css';

interface GameStartPageProps {
  currentPlayer: Player;
  onCreateRoom: (roomConfig: RoomConfig) => void;
  onJoinRoom: (roomId: string) => void;
  onDemoMode: () => void;
  onBack: () => void;
}

interface RoomConfig {
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
}

type GameMode = 'select' | 'create' | 'join' | 'demo';

const GameStartPage: React.FC<GameStartPageProps> = ({
  currentPlayer,
  onCreateRoom,
  onJoinRoom,
  onDemoMode,
  onBack
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [roomConfig, setRoomConfig] = useState<RoomConfig>({
    name: `${currentPlayer.name}的房间`,
    maxPlayers: 4,
    isPrivate: false
  });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomConfig.name.trim()) return;
    
    setLoading(true);
    try {
      await onCreateRoom(roomConfig);
    } catch (error) {
      console.error('创建房间失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinRoomId.trim()) return;
    
    setLoading(true);
    try {
      await onJoinRoom(joinRoomId.trim());
    } catch (error) {
      console.error('加入房间失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    setLoading(true);
    onDemoMode();
  };

  // 模式选择阶段
  if (gameMode === 'select') {
    return (
      <div className="game-start-page" data-testid="game-start-page">
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
            <span className="breadcrumb-current">游戏模式选择</span>
          </div>

          {/* 🎯 页面头部 */}
          <div className="page-header">
            <h1 className="page-title">选择游戏模式</h1>
            <p className="page-subtitle">
              选择您想要的游戏方式，开始一场精彩的桌游之旅
            </p>
          </div>

          {/* 🎮 游戏模式选择 */}
          <div className="game-modes-section">
            <div className="modes-grid">
              
              {/* 创建房间模式 */}
              <div 
                className="game-mode-card mode-card--featured" 
                onClick={() => setGameMode('create')}
                data-testid="create-room-mode"
              >
                <div className="mode-header">
                  <div className="mode-icon mode-icon--create">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                    </svg>
                  </div>
                  <div className="mode-badge">推荐</div>
                </div>
                
                <div className="mode-content">
                  <h3 className="mode-title">创建房间</h3>
                  <p className="mode-description">
                    成为房主，设置游戏规则，邀请朋友加入您的专属游戏空间
                  </p>
                  
                  <div className="mode-features">
                    <div className="feature-item">
                      <span className="feature-icon">⚙️</span>
                      <span>自定义房间设置</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">👥</span>
                      <span>邀请朋友加入</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🎮</span>
                      <span>选择游戏模板</span>
                    </div>
                  </div>
                </div>
                
                <div className="mode-action">
                  <span className="action-text">创建房间</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>

              {/* 加入房间模式 */}
              <div 
                className="game-mode-card" 
                onClick={() => setGameMode('join')}
                data-testid="join-room-mode"
              >
                <div className="mode-header">
                  <div className="mode-icon mode-icon--join">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4l4 4-4 4-1.4-1.4L16.2 9H4V7h12.2l-1.6-1.6L16 4z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="mode-content">
                  <h3 className="mode-title">加入房间</h3>
                  <p className="mode-description">
                    使用房间ID快速加入朋友创建的游戏房间，立即开始游戏
                  </p>
                  
                  <div className="mode-features">
                    <div className="feature-item">
                      <span className="feature-icon">⚡</span>
                      <span>快速加入游戏</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🔗</span>
                      <span>输入房间ID</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🤝</span>
                      <span>与朋友一起玩</span>
                    </div>
                  </div>
                </div>
                
                <div className="mode-action">
                  <span className="action-text">加入房间</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>

              {/* 演示模式 */}
              <div 
                className="game-mode-card" 
                onClick={() => setGameMode('demo')}
                data-testid="demo-mode"
              >
                <div className="mode-header">
                  <div className="mode-icon mode-icon--demo">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20,2A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H6L2,22V4C2,2.89 2.9,2 4,2H20M8.5,14L9.91,12.58L11.33,14L15.83,9.5L14.41,8.08L11.33,11.16L9.91,9.75L8.5,11.16M8.5,6H16V8H8.5V6Z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="mode-content">
                  <h3 className="mode-title">演示模式</h3>
                  <p className="mode-description">
                    单人游戏体验，与智能AI对手对战，学习游戏规则和技巧
                  </p>
                  
                  <div className="mode-features">
                    <div className="feature-item">
                      <span className="feature-icon">🤖</span>
                      <span>AI智能对手</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">📚</span>
                      <span>学习游戏规则</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">🎓</span>
                      <span>练习游戏技巧</span>
                    </div>
                  </div>
                </div>
                
                <div className="mode-action">
                  <span className="action-text">开始演示</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* 💡 提示信息 */}
          <div className="help-section">
            <div className="help-card">
              <div className="help-icon">💡</div>
              <div className="help-content">
                <h4>新手提示</h4>
                <p>
                  第一次使用？建议先选择"演示模式"熟悉游戏操作，
                  然后创建房间邀请朋友一起游戏！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 创建房间阶段
  if (gameMode === 'create') {
    return (
      <div className="game-start-page">
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
          {/* 面包屑导航 */}
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
            <button className="breadcrumb-item" onClick={() => setGameMode('select')}>
              游戏模式
            </button>
            <span className="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <span className="breadcrumb-current">创建房间</span>
          </div>

          {/* 进度指示器 */}
          <div className="progress-indicator">
            <div className="progress-step completed">
              <div className="step-icon">✓</div>
              <span className="step-label">选择模式</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step active">
              <div className="step-icon">2</div>
              <span className="step-label">房间设置</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <div className="step-icon">3</div>
              <span className="step-label">开始游戏</span>
            </div>
          </div>

          {/* 页面头部 */}
          <div className="page-header">
            <h1 className="page-title">创建游戏房间</h1>
            <p className="page-subtitle">
              设置您的专属游戏空间，邀请朋友一起畅玩桌游
            </p>
          </div>

          {/* 创建房间表单 */}
          <div className="form-section">
            <div className="create-room-form">
              <div className="form-header">
                <div className="form-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="form-title">房间配置</h3>
                  <p className="form-description">设置房间参数，打造完美的游戏环境</p>
                </div>
              </div>

              <div className="form-body">
                {/* 基础设置 */}
                <div className="form-section-group">
                  <h4 className="form-section-title">基础设置</h4>
                  
                  <div className="form-field">
                    <label className="field-label">
                      房间名称
                      <span className="field-required">*</span>
                    </label>
                    <input
                      type="text"
                      value={roomConfig.name}
                      onChange={(e) => setRoomConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="field-input"
                      placeholder="给您的房间起个名字"
                      maxLength={30}
                      data-testid="room-name-input"
                    />
                    <div className="field-hint">
                      房间名称将显示在好友的邀请中，建议使用有意义的名称
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label className="field-label">最大人数</label>
                      <select
                        value={roomConfig.maxPlayers}
                        onChange={(e) => setRoomConfig(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                        className="field-select"
                        data-testid="max-players-select"
                      >
                        <option value={2}>2人对战</option>
                        <option value={3}>3人竞技</option>
                        <option value={4}>4人团战</option>
                        <option value={6}>6人大混战</option>
                        <option value={8}>8人超级对决</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="field-label">房间类型</label>
                      <select
                        value={roomConfig.isPrivate ? 'private' : 'public'}
                        onChange={(e) => setRoomConfig(prev => ({ ...prev, isPrivate: e.target.value === 'private' }))}
                        className="field-select"
                        data-testid="room-type-select"
                      >
                        <option value="public">公开房间</option>
                        <option value="private">私密房间</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 高级设置 */}
                {roomConfig.isPrivate && (
                  <div className="form-section-group">
                    <h4 className="form-section-title">安全设置</h4>
                    
                    <div className="form-field">
                      <label className="field-label">
                        房间密码
                        <span className="field-required">*</span>
                      </label>
                      <input
                        type="password"
                        value={roomConfig.password || ''}
                        onChange={(e) => setRoomConfig(prev => ({ ...prev, password: e.target.value }))}
                        className="field-input"
                        placeholder="设置6-20位密码"
                        maxLength={20}
                        data-testid="room-password-input"
                      />
                      <div className="field-hint">
                        私密房间需要密码才能加入，请妥善保管并告知朋友
                      </div>
                    </div>
                  </div>
                )}

                {/* 房间预览 */}
                <div className="room-preview">
                  <h4 className="preview-title">房间预览</h4>
                  <div className="preview-card">
                    <div className="preview-header">
                      <div className="preview-name">{roomConfig.name || '房间名称'}</div>
                      <div className="preview-type">
                        {roomConfig.isPrivate ? '🔒 私密' : '🌐 公开'}
                      </div>
                    </div>
                    <div className="preview-info">
                      <span className="preview-players">👥 最多 {roomConfig.maxPlayers} 人</span>
                      <span className="preview-host">🎯 房主: {currentPlayer.name}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="form-actions">
                  <button 
                    className="btn btn--outline btn--lg"
                    onClick={() => setGameMode('select')}
                    disabled={loading}
                  >
                    返回选择
                  </button>
                  <button
                    className="btn btn--primary btn--lg"
                    onClick={handleCreateRoom}
                    disabled={!roomConfig.name.trim() || (roomConfig.isPrivate && !roomConfig.password?.trim()) || loading}
                    data-testid="create-room-button"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        创建中...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🏠</span>
                        创建房间
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 加入房间阶段
  if (gameMode === 'join') {
    return (
      <div className="game-start-page">
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
          {/* 面包屑导航 */}
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
            <button className="breadcrumb-item" onClick={() => setGameMode('select')}>
              游戏模式
            </button>
            <span className="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <span className="breadcrumb-current">加入房间</span>
          </div>

          {/* 页面头部 */}
          <div className="page-header">
            <h1 className="page-title">加入游戏房间</h1>
            <p className="page-subtitle">
              输入朋友分享的房间ID，立即加入精彩的桌游对战
            </p>
          </div>

          <div className="form-section">
            <div className="join-room-form">
              <div className="form-header">
                <div className="form-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4l4 4-4 4-1.4-1.4L16.2 9H4V7h12.2l-1.6-1.6L16 4z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="form-title">快速加入</h3>
                  <p className="form-description">使用房间ID立即加入朋友的游戏</p>
                </div>
              </div>

              <div className="form-body">
                <div className="join-illustration">
                  <div className="illustration-steps">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-text">朋友创建房间</div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-text">分享房间ID</div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-text">您输入ID加入</div>
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">
                    房间ID
                    <span className="field-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="field-input room-id-input"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    placeholder="输入房间ID（如：ROOM123）"
                    maxLength={20}
                    data-testid="join-room-input"
                  />
                  <div className="field-hint">
                    房间ID通常由字母和数字组成，请向房主确认正确的ID
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn--outline btn--lg"
                    onClick={() => setGameMode('select')}
                    disabled={loading}
                  >
                    返回选择
                  </button>
                  <button 
                    className="btn btn--primary btn--lg"
                    onClick={handleJoinRoom}
                    disabled={!joinRoomId.trim() || loading}
                    data-testid="join-room-button"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        加入中...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🔗</span>
                        加入房间
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 演示模式阶段
  if (gameMode === 'demo') {
    return (
      <div className="game-start-page">
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
          {/* 面包屑导航 */}
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
            <button className="breadcrumb-item" onClick={() => setGameMode('select')}>
              游戏模式
            </button>
            <span className="breadcrumb-separator">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </span>
            <span className="breadcrumb-current">演示模式</span>
          </div>

          {/* 页面头部 */}
          <div className="page-header">
            <h1 className="page-title">AI演示模式</h1>
            <p className="page-subtitle">
              与智能AI对手进行单人游戏，学习游戏规则，提升游戏技巧
            </p>
          </div>

          <div className="form-section">
            <div className="demo-form">
              <div className="form-header">
                <div className="form-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20,2A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H6L2,22V4C2,2.89 2.9,2 4,2H20M8.5,14L9.91,12.58L11.33,14L15.83,9.5L14.41,8.08L11.33,11.16L9.91,9.75L8.5,11.16M8.5,6H16V8H8.5V6Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="form-title">AI智能对手</h3>
                  <p className="form-description">体验我们先进的AI助手，享受挑战性的游戏对战</p>
                </div>
              </div>

              <div className="form-body">
                <div className="demo-features-grid">
                  <div className="demo-feature">
                    <div className="feature-icon">🎓</div>
                    <h4>学习游戏规则</h4>
                    <p>AI会在游戏过程中解释规则，帮助新手快速上手</p>
                  </div>
                  
                  <div className="demo-feature">
                    <div className="feature-icon">🏆</div>
                    <h4>练习游戏技巧</h4>
                    <p>通过与AI对战，磨练您的策略思维和操作技巧</p>
                  </div>
                  
                  <div className="demo-feature">
                    <div className="feature-icon">💡</div>
                    <h4>获得策略建议</h4>
                    <p>AI助手会适时提供策略建议，帮助您理解游戏深度</p>
                  </div>
                  
                  <div className="demo-feature">
                    <div className="feature-icon">⚡</div>
                    <h4>即时开始游戏</h4>
                    <p>无需等待其他玩家，随时随地开始您的游戏练习</p>
                  </div>
                </div>

                <div className="ai-info-card">
                  <div className="ai-avatar">🤖</div>
                  <div className="ai-description">
                    <h4>您的AI对手</h4>
                    <p>
                      我是您的AI游戏伙伴，拥有丰富的桌游知识和适应性的游戏策略。
                      我会根据您的水平调整难度，确保游戏既有挑战性又充满乐趣。
                    </p>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn--outline btn--lg"
                    onClick={() => setGameMode('select')}
                    disabled={loading}
                  >
                    返回选择
                  </button>
                  <button 
                    className="btn btn--primary btn--lg"
                    onClick={handleDemoMode}
                    disabled={loading}
                    data-testid="demo-mode-button"
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        启动中...
                      </>
                    ) : (
                      <>
                        <span className="btn-icon">🎮</span>
                        开始演示
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GameStartPage; 