import React, { useState, useEffect } from 'react';
import { Player } from '../../types/common';
import { StorageService } from '../../services/StorageService';
import './PlayerSetupModal.css';

interface PlayerSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSetup: (player: Player) => void;
  existingPlayer?: Player | null;
}

const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  isOpen,
  onClose,
  onPlayerSetup,
  existingPlayer
}) => {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const avatarEmojis = ['👤', '🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🚀', '⚡', '🔥', '✨'];

  useEffect(() => {
    if (existingPlayer) {
      setPlayerName(existingPlayer.name);
      // 尝试从emoji中找到匹配的头像索引
      const avatarIndex = avatarEmojis.findIndex(emoji => emoji === existingPlayer.avatar);
      setSelectedAvatar(avatarIndex >= 0 ? avatarIndex : 0);
    }
  }, [existingPlayer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const player: Player = {
        id: existingPlayer?.id || generatePlayerId(),
        name: playerName.trim(),
        avatar: avatarEmojis[selectedAvatar],
        isHost: false,
        isConnected: true
      };

      // 保存到本地存储
      const storageService = StorageService.getInstance();
      storageService.savePlayer(player);

      onPlayerSetup(player);
      onClose();
    } catch (error) {
      console.error('保存玩家信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlayerId = (): string => {
    return 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{existingPlayer ? '编辑玩家信息' : '设置玩家信息'}</h2>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="playerName">玩家昵称</label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="请输入您的昵称"
              maxLength={20}
              required
              disabled={isLoading}
              autoFocus
            />
            <div className="input-hint">
              {playerName.length}/20 字符
            </div>
          </div>

          <div className="form-group">
            <label>选择头像</label>
            <div className="avatar-grid">
              {avatarEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  className={`avatar-option ${selectedAvatar === index ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(index)}
                  disabled={isLoading}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="preview-section">
            <h3>预览</h3>
            <div className="player-preview">
              <div className="preview-avatar">
                {avatarEmojis[selectedAvatar]}
              </div>
              <div className="preview-name">
                {playerName || '未命名玩家'}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={!playerName.trim() || isLoading}
            >
              {isLoading ? '保存中...' : (existingPlayer ? '更新信息' : '完成设置')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerSetupModal; 