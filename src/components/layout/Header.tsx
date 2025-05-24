import React from 'react';
import './Header.css';

interface HeaderProps {
  playerName?: string;
  onPlayerClick?: () => void;
  onNavigate?: (page: 'home' | 'templates') => void;
  currentPage?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  playerName, 
  onPlayerClick, 
  onNavigate,
  currentPage = 'home'
}) => {
  const handleNavigate = (page: 'home' | 'templates') => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="logo-button"
            onClick={() => handleNavigate('home')}
          >
            <h1 className="app-title">桌游伴侣</h1>
            <span className="app-subtitle">Tabletop Companion</span>
          </button>
        </div>
        
        <nav className="header-nav">
          <button 
            className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigate('home')}
          >
            主页
          </button>
          <button 
            className={`nav-button ${currentPage === 'templates' ? 'active' : ''}`}
            onClick={() => handleNavigate('templates')}
          >
            模板库
          </button>
        </nav>
        
        <div className="header-right">
          {playerName ? (
            <button className="player-info" onClick={onPlayerClick}>
              <div className="player-avatar">
                {playerName.charAt(0).toUpperCase()}
              </div>
              <span className="player-name">{playerName}</span>
            </button>
          ) : (
            <button className="login-button" onClick={onPlayerClick}>
              设置玩家
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 