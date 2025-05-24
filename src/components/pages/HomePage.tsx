import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/StorageService';
import { Player } from '../../types/common';
import './HomePage.css';

interface HomePageProps {
  currentPlayer: Player | null;
  onManageTemplates: () => void;
  onPlayerSetup: () => void;
  onAISettings?: () => void;
  onStartGame?: () => void;
}

// 页面状态类型
type PageState = 'home' | 'room-manager';

const HomePage: React.FC<HomePageProps> = ({
  currentPlayer,
  onManageTemplates,
  onPlayerSetup,
  onAISettings,
  onStartGame: externalStartGame
}) => {
  const [recentRooms, setRecentRooms] = useState([]);
  const [pageState] = useState<PageState>('home');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storageService = StorageService.getInstance();
    
    // 加载最近房间
    const roomHistory = storageService.getRoomHistory();
    setRecentRooms(roomHistory.slice(0, 3) as any);
  };

  const handleStartGame = () => {
    if (!currentPlayer) {
      // 为测试环境保存alert消息
      if (typeof window !== 'undefined') {
        (window as any).lastAlertMessage = '请先设置玩家信息';
      }
      alert('请先设置玩家信息');
      onPlayerSetup();
      return;
    }
    
    // 现在导航到游戏启动页面而不是直接开始演示
    if (externalStartGame) {
      externalStartGame();
    } else {
      if (typeof window !== 'undefined') {
        (window as any).lastAlertMessage = '功能暂时不可用，请使用"立即开始"按钮进入游戏演示模式';
      }
      alert('功能暂时不可用，请使用"立即开始"按钮进入游戏演示模式');
    }
  };

  // 如果在房间管理器页面，渲染RoomManager
  if (pageState === 'room-manager' && currentPlayer) {
    return <div>房间管理器暂时不可用</div>;
  }

  return (
    <div className="home-page" data-testid="home-page">
      {/* 🧭 顶部导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎲</div>
          <span className="navbar-app-name">桌游伴侣</span>
        </div>
        
        <div className="navbar-links">
          <a href="#" className="nav-link active">主页</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleStartGame(); }}>创建游戏</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onManageTemplates(); }}>模板管理</a>
          <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onAISettings?.(); }}>AI助手</a>
          <a href="#" className="nav-link">帮助</a>
        </div>
        
        <div className="navbar-user">
          {currentPlayer ? (
            <>
              <div className="user-avatar">{currentPlayer.name.charAt(0).toUpperCase()}</div>
              <span className="user-name">{currentPlayer.name}</span>
            </>
          ) : (
            <button className="btn btn--sm btn--outline" onClick={onPlayerSetup}>
              登录/注册
            </button>
          )}
        </div>
      </nav>

      <div className="page-container">
        {/* 🎯 增强的欢迎区域 */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              {currentPlayer 
                ? `欢迎回来，${currentPlayer.name}！` 
                : '开启您的桌游冒险之旅'
              }
            </h1>
            <p className="hero-subtitle">
              {currentPlayer 
                ? '准备好与朋友一起享受精彩的桌游时光了吗？选择一个游戏模式开始您的新冒险！'
                : '与朋友在线畅玩各种桌游，体验AI助手带来的智能游戏指导，让每一局都充满惊喜！'
              }
            </p>
            
            {/* 用户状态与快速信息 */}
            {currentPlayer && (
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-value">{recentRooms.length}</span>
                  <span className="stat-label">最近游戏</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">在线</span>
                  <span className="stat-label">状态</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 主要CTA按钮 */}
          <div className="hero-actions">
            <button 
              className="btn btn--lg btn--primary hero-cta"
              onClick={handleStartGame}
              data-testid="hero-start-game"
            >
              <span className="btn-icon">🎮</span>
              {currentPlayer ? '开始新游戏' : '立即体验'}
            </button>
            {!currentPlayer && (
              <button 
                className="btn btn--lg btn--outline"
                onClick={onPlayerSetup}
              >
                设置玩家信息
              </button>
            )}
          </div>
        </section>

        {/* 🚀 重新设计的快速操作区域 */}
        <section className="quick-actions-section">
          <div className="section-header">
            <h2 className="section-title">快速开始</h2>
            <p className="section-subtitle">选择您想要进行的操作，一键直达</p>
          </div>
          
          <div className="quick-actions-grid">
            {/* 创建/加入游戏 - 主要操作 */}
            <div className="action-card action-card--featured" onClick={handleStartGame} data-testid="start-game-card">
              <div className="card-decoration"></div>
              <div className="card-icon card-icon--primary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3 className="card-title">开始游戏</h3>
                <p className="card-description">
                  创建新房间或加入朋友的游戏，开启多人在线桌游体验
                </p>
                <div className="card-features">
                  <span className="feature-tag">多人在线</span>
                  <span className="feature-tag">实时对战</span>
                </div>
              </div>
              <div className="card-action">
                <span className="action-text">立即开始</span>
                <span className="action-arrow">→</span>
              </div>
            </div>

            {/* 模板管理 */}
            <div className="action-card" onClick={onManageTemplates} data-testid="template-management-card">
              <div className="card-icon card-icon--secondary">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3 className="card-title">模板管理</h3>
                <p className="card-description">
                  导入、管理游戏模板，探索更多精彩的桌游玩法
                </p>
              </div>
              <div className="card-action">
                <span className="action-text">管理模板</span>
                <span className="action-arrow">→</span>
              </div>
            </div>

            {/* AI助手设置 */}
            <div className="action-card" onClick={onAISettings} data-testid="ai-settings-card">
              <div className="card-icon card-icon--ai">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,2A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H6L2,22V4C2,2.89 2.9,2 4,2H20M8.5,14L9.91,12.58L11.33,14L15.83,9.5L14.41,8.08L11.33,11.16L9.91,9.75L8.5,11.16M8.5,6H16V8H8.5V6Z"/>
                </svg>
              </div>
              <div className="card-content">
                <h3 className="card-title">AI助手设置</h3>
                <p className="card-description">
                  配置智能AI助手，获得个性化的游戏指导体验
                </p>
              </div>
              <div className="card-action">
                <span className="action-text">配置AI</span>
                <span className="action-arrow">→</span>
              </div>
            </div>

            {/* 玩家设置 - 条件显示 */}
            {!currentPlayer && (
              <div className="action-card" onClick={onPlayerSetup} data-testid="player-setup-card">
                <div className="card-icon card-icon--accent">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 15.9 11 17 11S19 10.1 19 11V19H21V9ZM3 9V19H5V11C5 10.1 5.9 9 7 9S9 10.1 9 11V19H11V9L5 7.5V9H3ZM8 22H16V24H8V22Z"/>
                  </svg>
                </div>
                <div className="card-content">
                  <h3 className="card-title">设置玩家</h3>
                  <p className="card-description">
                    创建您的玩家档案，个性化您的游戏体验
                  </p>
                </div>
                <div className="card-action">
                  <span className="action-text">立即设置</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 📝 最近游戏区域 - 条件渲染且重新设计 */}
        {recentRooms.length > 0 && (
          <section className="recent-section" data-testid="recent-rooms">
            <div className="section-header">
              <h2 className="section-title">最近的游戏</h2>
              <button className="btn btn--sm btn--ghost">查看全部</button>
            </div>
            
            <div className="recent-rooms-grid">
              {recentRooms.map((room: any) => (
                <div 
                  key={room.id} 
                  className="room-card"
                  onClick={handleStartGame}
                  data-testid={`room-card-${room.id}`}
                >
                  <div className="room-header">
                    <h4 className="room-name">{room.name}</h4>
                    <span className="room-status">已结束</span>
                  </div>
                  
                  <div className="room-info">
                    <div className="room-meta">
                      <span className="room-players">
                        👥 {room.players?.length || 0}/{room.maxPlayers} 玩家
                      </span>
                      <span className="room-date">
                        📅 {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="room-action">
                    <button className="btn btn--sm btn--outline">重新开始</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ✨ 重新设计的功能特性区域 */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">为什么选择桌游伴侣？</h2>
            <p className="section-subtitle">体验下一代在线桌游平台的强大功能</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="feature-title">无服务器P2P连接</h3>
              <p className="feature-description">
                基于WebRTC技术的点对点连接，无需依赖中心服务器，享受低延迟的实时游戏体验
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="feature-title">丰富的游戏模板</h3>
              <p className="feature-description">
                支持导入自定义游戏模板，轻松添加新的桌游规则，从GitHub社区获取更多精彩内容
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,2A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H6L2,22V4C2,2.89 2.9,2 4,2H20M8.5,14L9.91,12.58L11.33,14L15.83,9.5L14.41,8.08L11.33,11.16L9.91,9.75L8.5,11.16M8.5,6H16V8H8.5V6Z"/>
                </svg>
              </div>
              <h3 className="feature-title">智能AI助手</h3>
              <p className="feature-description">
                内置AI助手提供规则解答、策略建议和实时游戏指导，让新手也能快速上手各种桌游
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,12C17,14.42 15.28,16.44 13,16.9V21H11V16.9C8.72,16.44 7,14.42 7,12C7,9.58 8.72,7.56 11,7.1V3H13V7.1C15.28,7.56 17,9.58 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
                </svg>
              </div>
              <h3 className="feature-title">跨设备同步</h3>
              <p className="feature-description">
                自动保存游戏进度和玩家信息，支持多设备无缝切换，随时随地继续您的游戏
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 