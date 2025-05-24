import React, { useState } from 'react';
import { Player } from '../../types/common';
import Button from '../ui/Button';
import Card from '../ui/Card';
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

  if (gameMode === 'select') {
    return (
      <div className="game-start-page">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">选择游戏模式</h1>
            <p className="page-subtitle">
              选择您想要的游戏方式，开始您的桌游之旅
            </p>
          </div>

          <div className="game-modes">
            <div className="grid grid--cols-3">
              {/* 创建房间 */}
              <Card
                variant="elevated"
                hoverable
                clickable
                onClick={() => setGameMode('create')}
                className="game-mode-card game-mode-card--create"
              >
                <div className="mode-icon">🏠</div>
                <h3 className="mode-title">创建房间</h3>
                <p className="mode-description">
                  创建新的游戏房间，邀请朋友一起游戏
                </p>
                <ul className="mode-features">
                  <li>✨ 自定义房间设置</li>
                  <li>👥 邀请朋友加入</li>
                  <li>🎮 选择游戏模板</li>
                </ul>
              </Card>

              {/* 加入房间 */}
              <Card
                variant="elevated"
                hoverable
                clickable
                onClick={() => setGameMode('join')}
                className="game-mode-card game-mode-card--join"
              >
                <div className="mode-icon">🔗</div>
                <h3 className="mode-title">加入房间</h3>
                <p className="mode-description">
                  通过房间ID加入朋友的游戏房间
                </p>
                <ul className="mode-features">
                  <li>⚡ 快速加入游戏</li>
                  <li>🎯 输入房间ID</li>
                  <li>🤝 与朋友一起玩</li>
                </ul>
              </Card>

              {/* 演示模式 */}
              <Card
                variant="elevated"
                hoverable
                clickable
                onClick={() => setGameMode('demo')}
                className="game-mode-card game-mode-card--demo"
              >
                <div className="mode-icon">🎯</div>
                <h3 className="mode-title">演示模式</h3>
                <p className="mode-description">
                  单人游戏体验，与AI对手进行游戏
                </p>
                <ul className="mode-features">
                  <li>🤖 AI智能对手</li>
                  <li>📚 学习游戏规则</li>
                  <li>🎓 练习游戏技巧</li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="actions">
            <Button variant="ghost" onClick={onBack}>
              返回主页
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'create') {
    return (
      <div className="game-start-page">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">创建游戏房间</h1>
            <p className="page-subtitle">
              设置您的房间参数，创建专属游戏空间
            </p>
          </div>

          <div className="form-container">
            <Card variant="elevated" padding="lg" className="create-room-form">
              <div className="form-group">
                <label className="form-label">房间名称</label>
                <input
                  type="text"
                  className="form-input"
                  value={roomConfig.name}
                  onChange={(e) => setRoomConfig({
                    ...roomConfig,
                    name: e.target.value
                  })}
                  placeholder="输入房间名称"
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label className="form-label">最大玩家数</label>
                <select
                  className="form-select"
                  value={roomConfig.maxPlayers}
                  onChange={(e) => setRoomConfig({
                    ...roomConfig,
                    maxPlayers: parseInt(e.target.value)
                  })}
                >
                  <option value={2}>2人</option>
                  <option value={3}>3人</option>
                  <option value={4}>4人</option>
                  <option value={6}>6人</option>
                  <option value={8}>8人</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={roomConfig.isPrivate}
                    onChange={(e) => setRoomConfig({
                      ...roomConfig,
                      isPrivate: e.target.checked
                    })}
                  />
                  <span className="checkbox-text">私人房间</span>
                </label>
                <p className="form-help">私人房间需要密码才能加入</p>
              </div>

              {roomConfig.isPrivate && (
                <div className="form-group">
                  <label className="form-label">房间密码</label>
                  <input
                    type="password"
                    className="form-input"
                    value={roomConfig.password || ''}
                    onChange={(e) => setRoomConfig({
                      ...roomConfig,
                      password: e.target.value
                    })}
                    placeholder="设置房间密码"
                    maxLength={20}
                  />
                </div>
              )}

              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setGameMode('select')}
                  disabled={loading}
                >
                  返回
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleCreateRoom}
                  loading={loading}
                  disabled={!roomConfig.name.trim()}
                >
                  创建房间
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'join') {
    return (
      <div className="game-start-page">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">加入游戏房间</h1>
            <p className="page-subtitle">
              输入房间ID，加入朋友的游戏房间
            </p>
          </div>

          <div className="form-container">
            <Card variant="elevated" padding="lg" className="join-room-form">
              <div className="join-illustration">
                <div className="join-icon">🔗</div>
                <p>输入您朋友分享的房间ID</p>
              </div>

              <div className="form-group">
                <label className="form-label">房间ID</label>
                <input
                  type="text"
                  className="form-input room-id-input"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="输入房间ID（如：ROOM123）"
                  maxLength={20}
                />
              </div>

              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setGameMode('select')}
                  disabled={loading}
                >
                  返回
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleJoinRoom}
                  loading={loading}
                  disabled={!joinRoomId.trim()}
                >
                  加入房间
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'demo') {
    return (
      <div className="game-start-page">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">演示模式</h1>
            <p className="page-subtitle">
              开始单人游戏体验，与AI对手进行游戏
            </p>
          </div>

          <div className="demo-container">
            <Card variant="elevated" padding="lg" className="demo-card">
              <div className="demo-illustration">
                <div className="demo-icon">🤖</div>
                <h3>AI智能对手</h3>
                <p>我们的AI助手将作为您的对手，提供挑战性的游戏体验</p>
              </div>

              <div className="demo-features">
                <div className="feature-item">
                  <span className="feature-icon">🎓</span>
                  <span>学习游戏规则</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🏆</span>
                  <span>练习游戏技巧</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💡</span>
                  <span>获得策略建议</span>
                </div>
              </div>

              <div className="form-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setGameMode('select')}
                  disabled={loading}
                >
                  返回
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleDemoMode}
                  loading={loading}
                >
                  开始演示
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default GameStartPage; 