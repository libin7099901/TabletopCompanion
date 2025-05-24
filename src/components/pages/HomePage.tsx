import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/StorageService';
import { Player } from '../../types/common';
import Button from '../ui/Button';
import Card from '../ui/Card';
import './HomePage.css';

interface HomePageProps {
  currentPlayer: Player | null;
  onManageTemplates: () => void;
  onPlayerSetup: () => void;
  onStartGame?: () => void;
}

// 页面状态类型
type PageState = 'home' | 'room-manager';

const HomePage: React.FC<HomePageProps> = ({
  currentPlayer,
  onManageTemplates,
  onPlayerSetup,
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
      alert('请先设置玩家信息');
      onPlayerSetup();
      return;
    }
    
    // 现在导航到游戏启动页面而不是直接开始演示
    if (externalStartGame) {
      externalStartGame();
    } else {
      alert('功能暂时不可用，请使用"立即开始"按钮进入游戏演示模式');
    }
  };

  // 如果在房间管理器页面，渲染RoomManager
  if (pageState === 'room-manager' && currentPlayer) {
    return <div>房间管理器暂时不可用</div>;
  }

  return (
    <div className="home-page">
      <div className="page-container">
        {/* 🎯 欢迎区域 */}
        <section className="welcome-section">
          <div className="page-header">
            <h1 className="page-title">
              {currentPlayer ? `欢迎回来，${currentPlayer.name}！` : '欢迎使用桌游伴侣'}
            </h1>
            <p className="page-subtitle">
              {currentPlayer 
                ? '准备开始游戏了吗？创建房间或加入朋友的游戏，享受桌游的乐趣！'
                : '开始您的桌游之旅，与朋友在线对战，体验智能AI助手的游戏指导'
              }
            </p>
          </div>
        </section>

        {/* 🚀 快速操作区域 */}
        <section className="quick-actions-section">
          <h2 className="section-title">快速开始</h2>
          <div className="grid grid--cols-3 action-cards">
            {/* 开始游戏卡片 */}
            <Card 
              variant="elevated" 
              hoverable 
              clickable 
              onClick={handleStartGame}
              className="action-card action-card--primary"
            >
              <div className="card__header">
                <div className="card-icon">🎮</div>
              </div>
              <div className="card__content">
                <h3 className="card__title">开始游戏</h3>
                <p className="card-description">
                  创建新房间或加入现有房间，与朋友开始多人在线游戏
                </p>
              </div>
              <div className="card__footer">
                <Button variant="primary" size="sm" fullWidth>
                  立即开始
                </Button>
              </div>
            </Card>
            
            {/* 模板管理卡片 */}
            <Card 
              variant="elevated" 
              hoverable 
              clickable 
              onClick={onManageTemplates}
              className="action-card action-card--secondary"
            >
              <div className="card__header">
                <div className="card-icon">📦</div>
              </div>
              <div className="card__content">
                <h3 className="card__title">模板管理</h3>
                <p className="card-description">
                  导入新的游戏模板，管理现有模板或创建自定义游戏
                </p>
              </div>
              <div className="card__footer">
                <Button variant="secondary" size="sm" fullWidth>
                  管理模板
                </Button>
              </div>
            </Card>
            
            {/* 设置玩家卡片 - 仅在未设置玩家时显示 */}
            {!currentPlayer && (
              <Card 
                variant="elevated" 
                hoverable 
                clickable 
                onClick={onPlayerSetup}
                className="action-card action-card--accent"
              >
                <div className="card__header">
                  <div className="card-icon">👤</div>
                </div>
                <div className="card__content">
                  <h3 className="card__title">设置玩家</h3>
                  <p className="card-description">
                    设置您的玩家信息，包括昵称、头像和游戏偏好
                  </p>
                </div>
                <div className="card__footer">
                  <Button variant="outline" size="sm" fullWidth>
                    设置信息
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* 📝 最近房间区域 */}
        {recentRooms.length > 0 && (
          <section className="recent-rooms-section">
            <h2 className="section-title">最近的房间</h2>
            <div className="recent-rooms-list">
              {recentRooms.map((room: any) => (
                <Card 
                  key={room.id} 
                  variant="outlined" 
                  hoverable 
                  clickable
                  onClick={handleStartGame}
                  className="room-card"
                >
                  <div className="flex justify-between items-center">
                    <div className="room-info">
                      <h4 className="room-name">{room.name}</h4>
                      <p className="room-details text-sm text-neutral-600">
                        {room.players?.length || 0}/{room.maxPlayers} 玩家 • 
                        {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      重新加入
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ✨ 功能介绍区域 */}
        <section className="features-section">
          <h2 className="section-title">功能特性</h2>
          <div className="grid grid--cols-4 features-grid">
            <Card variant="ghost" className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">实时多人游戏</h3>
              <p className="feature-description">
                基于WebRTC技术的P2P连接，无需服务器即可与朋友实时游戏
              </p>
            </Card>
            
            <Card variant="ghost" className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">游戏模板系统</h3>
              <p className="feature-description">
                支持导入自定义游戏模板，轻松添加新的桌游规则和玩法
              </p>
            </Card>
            
            <Card variant="ghost" className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI智能助手</h3>
              <p className="feature-description">
                内置AI助手提供规则解答、策略建议和实时游戏指导
              </p>
            </Card>
            
            <Card variant="ghost" className="feature-card">
              <div className="feature-icon">💾</div>
              <h3 className="feature-title">数据同步</h3>
              <p className="feature-description">
                自动保存游戏进度，跨设备同步玩家信息和游戏历史
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 