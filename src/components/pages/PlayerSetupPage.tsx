// 🎮 玩家设置页面 - 现代化重构版

import React, { useState, useEffect } from 'react';
import { Player } from '../../types/common';
import './PlayerSetupPage.css';

interface PlayerSetupPageProps {
  onNext: (player: Player) => void;
  onBack: () => void;
  existingPlayer?: Player;
}

const PlayerSetupPage: React.FC<PlayerSetupPageProps> = ({
  onNext,
  onBack,
  existingPlayer
}) => {
  const [playerName, setPlayerName] = useState(existingPlayer?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(existingPlayer?.avatar || '👤');
  const [gamePreferences, setGamePreferences] = useState({
    favoriteGameType: existingPlayer?.preferences?.favoriteGameType || 'any',
    skillLevel: existingPlayer?.preferences?.skillLevel || 'beginner',
    playStyle: existingPlayer?.preferences?.playStyle || 'casual',
    aiAssistance: existingPlayer?.preferences?.aiAssistance !== false,
    soundEffects: existingPlayer?.preferences?.soundEffects !== false,
    animations: existingPlayer?.preferences?.animations !== false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  // 头像选项
  const avatarOptions = [
    '👤', '😀', '😎', '🤠', '👩', '👨', '👧', '👦',
    '🧑‍💻', '👩‍🎨', '👨‍🎮', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🤖',
    '🐱', '🐶', '🦊', '🐺', '🐸', '🐵', '🐼', '🦄'
  ];

  // 游戏类型选项
  const gameTypeOptions = [
    { value: 'any', label: '全部类型', icon: '🎮', description: '我对所有类型的游戏都感兴趣' },
    { value: 'card', label: '卡牌游戏', icon: '🃏', description: '我喜欢策略和运气的结合' },
    { value: 'board', label: '棋盘游戏', icon: '♟️', description: '我热爱策略和深度思考' },
    { value: 'dice', label: '骰子游戏', icon: '🎲', description: '我享受随机性和刺激感' },
    { value: 'strategy', label: '策略游戏', icon: '🧠', description: '我专注于复杂的策略规划' }
  ];

  // 技能等级选项
  const skillLevelOptions = [
    { 
      value: 'beginner', 
      label: '新手', 
      description: '我是游戏新手，正在学习中',
      features: ['基础教程', '游戏提示', 'AI建议']
    },
    { 
      value: 'intermediate', 
      label: '中级', 
      description: '我有一些游戏经验',
      features: ['策略指导', '进阶技巧', '战术分析']
    },
    { 
      value: 'advanced', 
      label: '高级', 
      description: '我是经验丰富的玩家',
      features: ['复杂策略', '高级技巧', '竞技模式']
    },
    { 
      value: 'expert', 
      label: '专家', 
      description: '我精通各类游戏',
      features: ['专家对战', '自定义规则', '教学模式']
    }
  ];

  // 游戏风格选项
  const playStyleOptions = [
    { 
      value: 'casual', 
      label: '休闲', 
      description: '我喜欢轻松愉快的游戏',
      icon: '🌸',
      color: 'success'
    },
    { 
      value: 'competitive', 
      label: '竞技', 
      description: '我热衷于激烈的竞争',
      icon: '🏆',
      color: 'warning'
    },
    { 
      value: 'strategic', 
      label: '策略', 
      description: '我享受深度思考的过程',
      icon: '🧩',
      color: 'info'
    },
    { 
      value: 'social', 
      label: '社交', 
      description: '我重视与朋友的互动',
      icon: '👥',
      color: 'primary'
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!playerName.trim()) {
      newErrors.push('请输入玩家名称');
    } else if (playerName.trim().length < 2) {
      newErrors.push('玩家名称至少需要2个字符');
    } else if (playerName.trim().length > 20) {
      newErrors.push('玩家名称不能超过20个字符');
    }

    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(playerName.trim())) {
      newErrors.push('玩家名称只能包含字母、数字、中文、下划线和横线');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const player: Player = {
      id: existingPlayer?.id || `player_${Date.now()}`,
      name: playerName.trim(),
      avatar: selectedAvatar,
      isHost: existingPlayer?.isHost || false,
      isConnected: true,
      preferences: {
        ...gamePreferences,
        createdAt: existingPlayer?.preferences?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    localStorage.setItem('playerProfile', JSON.stringify(player));
    onNext(player);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setGamePreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateForm()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    if (errors.length > 0 && playerName.trim()) {
      setErrors([]);
    }
  }, [playerName]);

  return (
    <div className="player-setup-page" data-testid="player-setup-page">
      {/* 🧭 导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎲</div>
          <span className="navbar-app-name">桌游伴侣</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-avatar">{selectedAvatar}</div>
          <span className="user-name">{playerName || '新玩家'}</span>
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
          <span className="breadcrumb-current">玩家设置</span>
        </div>

        {/* 🎯 页面头部 */}
        <div className="page-header">
          <h1 className="page-title">创建您的游戏档案</h1>
          <p className="page-subtitle">
            个性化设置您的游戏偏好，获得最佳的桌游体验
          </p>
        </div>

        {/* 📈 进度指示器 */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-icon">{currentStep >= 1 ? '✓' : '1'}</div>
            <span className="step-label">基本信息</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-icon">{currentStep >= 2 ? '✓' : '2'}</div>
            <span className="step-label">游戏偏好</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-icon">{currentStep >= 3 ? '✓' : '3'}</div>
            <span className="step-label">功能设置</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}`}>
            <div className="step-icon">{currentStep >= 4 ? '✓' : '4'}</div>
            <span className="step-label">完成</span>
          </div>
        </div>

        {/* 📝 设置内容 */}
        <div className="setup-content">
          {/* 步骤1: 基本信息 */}
          {currentStep === 1 && (
            <div className="step-content basic-info-step">
              <div className="setup-card">
                <div className="card-header">
                  <div className="card-icon">👤</div>
                  <div className="card-title">
                    <h3>基本信息</h3>
                    <p>设置您的游戏身份和头像</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="form-group">
                    <label className="form-label">
                      玩家名称 <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onBlur={() => validateForm()}
                      placeholder="请输入您的玩家名称"
                      className={`form-input ${errors.length > 0 ? 'error' : ''}`}
                      maxLength={20}
                      data-testid="player-name-input"
                    />
                    <div className="input-hint">
                      2-20个字符，支持中文、英文和数字
                    </div>
                    {errors.length > 0 && (
                      <div className="error-messages">
                        {errors.map((error, index) => (
                          <div key={index} className="error-message">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                            </svg>
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">选择头像</label>
                    <div className="avatar-grid">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                          onClick={() => setSelectedAvatar(avatar)}
                          data-testid={`avatar-option-${avatar}`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤2: 游戏偏好 */}
          {currentStep === 2 && (
            <div className="step-content preferences-step">
              <div className="setup-card">
                <div className="card-header">
                  <div className="card-icon">🎮</div>
                  <div className="card-title">
                    <h3>游戏偏好</h3>
                    <p>告诉我们您喜欢什么类型的游戏</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="preference-section">
                    <h4 className="preference-title">喜欢的游戏类型</h4>
                    <div className="game-type-grid">
                      {gameTypeOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`game-type-card ${gamePreferences.favoriteGameType === option.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="favoriteGameType"
                            value={option.value}
                            checked={gamePreferences.favoriteGameType === option.value}
                            onChange={(e) => handlePreferenceChange('favoriteGameType', e.target.value)}
                          />
                          <div className="card-content">
                            <div className="card-icon-large">{option.icon}</div>
                            <h5 className="card-label">{option.label}</h5>
                            <p className="card-description">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="preference-section">
                    <h4 className="preference-title">技能等级</h4>
                    <div className="skill-level-options">
                      {skillLevelOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`skill-level-card ${gamePreferences.skillLevel === option.value ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="skillLevel"
                            value={option.value}
                            checked={gamePreferences.skillLevel === option.value}
                            onChange={(e) => handlePreferenceChange('skillLevel', e.target.value)}
                          />
                          <div className="skill-content">
                            <div className="skill-header">
                              <span className="skill-label">{option.label}</span>
                              <div className="skill-indicator">
                                {Array.from({ length: 4 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`indicator-dot ${i < skillLevelOptions.findIndex(opt => opt.value === option.value) + 1 ? 'active' : ''}`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <p className="skill-description">{option.description}</p>
                            <div className="skill-features">
                              {option.features.map((feature, index) => (
                                <span key={index} className="feature-tag">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 功能设置 */}
          {currentStep === 3 && (
            <div className="step-content settings-step">
              <div className="setup-card">
                <div className="card-header">
                  <div className="card-icon">⚙️</div>
                  <div className="card-title">
                    <h3>功能设置</h3>
                    <p>自定义您的游戏体验</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="preference-section">
                    <h4 className="preference-title">游戏风格</h4>
                    <div className="play-style-grid">
                      {playStyleOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`play-style-card ${gamePreferences.playStyle === option.value ? 'selected' : ''} style-${option.color}`}
                        >
                          <input
                            type="radio"
                            name="playStyle"
                            value={option.value}
                            checked={gamePreferences.playStyle === option.value}
                            onChange={(e) => handlePreferenceChange('playStyle', e.target.value)}
                          />
                          <div className="style-content">
                            <div className="style-icon">{option.icon}</div>
                            <h5 className="style-label">{option.label}</h5>
                            <p className="style-description">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="preference-section">
                    <h4 className="preference-title">功能开关</h4>
                    <div className="toggle-options">
                      <div className="toggle-card">
                        <label className="toggle-option">
                          <input
                            type="checkbox"
                            checked={gamePreferences.aiAssistance}
                            onChange={(e) => handlePreferenceChange('aiAssistance', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                          <div className="toggle-content">
                            <div className="toggle-header">
                              <span className="toggle-icon">🤖</span>
                              <span className="toggle-title">AI游戏助手</span>
                            </div>
                            <p className="toggle-description">
                              启用AI助手获得游戏建议、策略指导和规则解释
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="toggle-card">
                        <label className="toggle-option">
                          <input
                            type="checkbox"
                            checked={gamePreferences.soundEffects}
                            onChange={(e) => handlePreferenceChange('soundEffects', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                          <div className="toggle-content">
                            <div className="toggle-header">
                              <span className="toggle-icon">🔊</span>
                              <span className="toggle-title">音效提醒</span>
                            </div>
                            <p className="toggle-description">
                              开启游戏音效和操作反馈声音，增强游戏沉浸感
                            </p>
                          </div>
                        </label>
                      </div>

                      <div className="toggle-card">
                        <label className="toggle-option">
                          <input
                            type="checkbox"
                            checked={gamePreferences.animations}
                            onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                          />
                          <span className="toggle-slider"></span>
                          <div className="toggle-content">
                            <div className="toggle-header">
                              <span className="toggle-icon">✨</span>
                              <span className="toggle-title">动画效果</span>
                            </div>
                            <p className="toggle-description">
                              启用流畅的动画和过渡效果，让界面更加生动
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤4: 预览和完成 */}
          {currentStep === 4 && (
            <div className="step-content preview-step">
              <div className="setup-card">
                <div className="card-header">
                  <div className="card-icon">✨</div>
                  <div className="card-title">
                    <h3>档案预览</h3>
                    <p>确认您的设置并完成创建</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="player-preview">
                    <div className="preview-card">
                      <div className="preview-header">
                        <div className="preview-avatar">{selectedAvatar}</div>
                        <div className="preview-info">
                          <h4 className="preview-name">{playerName || '未设置名称'}</h4>
                          <div className="preview-id">ID: {existingPlayer?.id || `player_${Date.now()}`}</div>
                        </div>
                      </div>

                      <div className="preview-body">
                        <div className="preview-section">
                          <h5 className="preview-section-title">游戏偏好</h5>
                          <div className="preview-details">
                            <div className="preview-detail">
                              <span className="detail-icon">🎮</span>
                              <span className="detail-label">游戏类型：</span>
                              <span className="detail-value">
                                {gameTypeOptions.find(opt => opt.value === gamePreferences.favoriteGameType)?.label}
                              </span>
                            </div>
                            <div className="preview-detail">
                              <span className="detail-icon">📊</span>
                              <span className="detail-label">技能等级：</span>
                              <span className="detail-value">
                                {skillLevelOptions.find(opt => opt.value === gamePreferences.skillLevel)?.label}
                              </span>
                            </div>
                            <div className="preview-detail">
                              <span className="detail-icon">🎯</span>
                              <span className="detail-label">游戏风格：</span>
                              <span className="detail-value">
                                {playStyleOptions.find(opt => opt.value === gamePreferences.playStyle)?.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="preview-section">
                          <h5 className="preview-section-title">功能设置</h5>
                          <div className="preview-features">
                            {gamePreferences.aiAssistance && (
                              <span className="feature-tag active">🤖 AI助手</span>
                            )}
                            {gamePreferences.soundEffects && (
                              <span className="feature-tag active">🔊 音效</span>
                            )}
                            {gamePreferences.animations && (
                              <span className="feature-tag active">✨ 动画</span>
                            )}
                            {!gamePreferences.aiAssistance && !gamePreferences.soundEffects && !gamePreferences.animations && (
                              <span className="feature-tag inactive">未启用功能</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="completion-message">
                      <div className="completion-icon">🎉</div>
                      <h4>设置完成！</h4>
                      <p>您的游戏档案已经准备就绪，现在可以开始您的桌游之旅了。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔢 步骤导航 */}
        <div className="step-navigation">
          {currentStep > 1 && (
            <button 
              className="btn btn--outline btn--lg"
              onClick={prevStep}
              data-testid="prev-step-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
              上一步
            </button>
          )}

          <div className="step-info">
            <span className="step-text">第 {currentStep} 步，共 4 步</span>
          </div>

          {currentStep < 4 ? (
            <button 
              className="btn btn--primary btn--lg"
              onClick={nextStep}
              disabled={currentStep === 1 && (!playerName.trim() || errors.length > 0)}
              data-testid="next-step-btn"
            >
              下一步
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          ) : (
            <button
              className="btn btn--primary btn--lg"
              onClick={handleSubmit}
              disabled={!playerName.trim() || errors.length > 0}
              data-testid="complete-setup-btn"
            >
              <span className="btn-icon">🚀</span>
              完成设置
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerSetupPage; 