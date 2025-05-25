import React, { useState, useEffect, useMemo } from 'react';
import './TemplateManagePage.css';
import { gameLoader, ExtendedGameTemplate } from '../../services/DynamicGameLoader';

interface TemplateManagePageProps {
  onBack: () => void;
  onSelectTemplate: (templateId: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'rating' | 'downloads' | 'updated' | 'difficulty';
type FilterCategory = 'all' | 'strategy' | 'party' | 'card' | 'dice' | 'puzzle' | 'action' | 'simulation';
type FilterDifficulty = 'all' | 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

const TemplateManagePage: React.FC<TemplateManagePageProps> = ({
  onBack,
  onSelectTemplate
}) => {
  // === 状态管理 ===
  const [templates, setTemplates] = useState<ExtendedGameTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ExtendedGameTemplate | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');

  // === 数据加载 ===
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      console.log('🎮 开始加载模板...');
      
      // 预加载所有模板
      await gameLoader.preloadAll();
      const allTemplates = gameLoader.getAllTemplates();
      
      console.log('📊 加载的模板数量:', allTemplates.length);
      console.log('📋 模板列表:', allTemplates.map(t => t.name));
      
      setTemplates(allTemplates);
    } catch (error) {
      console.error('❌ 模板加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // === 过滤和排序 ===
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(template => template.category === filterCategory);
    }

    // 难度过滤
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === filterDifficulty);
    }

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (a.metadata.rating || 0) - (b.metadata.rating || 0);
          break;
        case 'downloads':
          comparison = (a.metadata.downloads || 0) - (b.metadata.downloads || 0);
          break;
        case 'updated':
          comparison = new Date(a.metadata.updated).getTime() - new Date(b.metadata.updated).getTime();
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'easy': 2, 'medium': 3, 'hard': 4, 'expert': 5 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [templates, searchQuery, filterCategory, filterDifficulty, sortBy, sortOrder]);

  // === 事件处理 ===
  const handleTemplateSelect = (template: ExtendedGameTemplate) => {
    setSelectedTemplate(template);
  };

  const handleStartGame = async (templateId: string) => {
    try {
      await gameLoader.loadTemplate(templateId);
      onSelectTemplate(templateId);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  // === 渲染方法 ===
  const renderTemplateCard = (template: ExtendedGameTemplate) => (
    <div 
      key={template.id} 
      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="template-thumbnail">
        <span className="template-emoji">{template.thumbnail}</span>
        <div className="template-badges">
          {template.features.aiSupport && (
            <span className="badge badge-ai">🤖 AI</span>
          )}
          {template.features.realTimePlay && (
            <span className="badge badge-realtime">⚡ 实时</span>
          )}
        </div>
      </div>
      
      <div className="template-info">
        <h3 className="template-name">{template.name}</h3>
        <p className="template-description">{template.description}</p>
        
        <div className="template-meta">
          <div className="meta-row">
            <span className="meta-label">玩家:</span>
            <span className="meta-value">
              {template.minPlayers === template.maxPlayers 
                ? `${template.minPlayers}人` 
                : `${template.minPlayers}-${template.maxPlayers}人`}
            </span>
          </div>
          
          <div className="meta-row">
            <span className="meta-label">时长:</span>
            <span className="meta-value">{template.estimatedTime}分钟</span>
          </div>
          
          <div className="meta-row">
            <span className="meta-label">难度:</span>
            <span className={`meta-value difficulty-${template.difficulty}`}>
              {getDifficultyLabel(template.difficulty)}
            </span>
          </div>
        </div>
        
        <div className="template-tags">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        
        <div className="template-stats">
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{template.metadata.rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <div className="stat">
            <span className="stat-icon">📥</span>
            <span className="stat-value">{formatNumber(template.metadata.downloads || 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="template-actions">
        <button 
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleStartGame(template.id);
          }}
        >
          开始游戏
        </button>
      </div>
    </div>
  );

  const renderTemplateList = (template: ExtendedGameTemplate) => (
    <div 
      key={template.id} 
      className={`template-list-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="list-thumbnail">
        <span className="template-emoji">{template.thumbnail}</span>
      </div>
      
      <div className="list-info">
        <h4 className="list-name">{template.name}</h4>
        <p className="list-description">{template.description}</p>
        <div className="list-tags">
          {template.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag-small">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="list-meta">
        <div className="list-players">{template.minPlayers}-{template.maxPlayers}人</div>
        <div className="list-time">{template.estimatedTime}分钟</div>
        <div className={`list-difficulty difficulty-${template.difficulty}`}>
          {getDifficultyLabel(template.difficulty)}
        </div>
      </div>
      
      <div className="list-stats">
        <div className="list-rating">
          ⭐ {template.metadata.rating?.toFixed(1) || 'N/A'}
        </div>
        <div className="list-downloads">
          📥 {formatNumber(template.metadata.downloads || 0)}
        </div>
      </div>
      
      <div className="list-actions">
        <button 
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleStartGame(template.id);
          }}
        >
          开始
        </button>
      </div>
    </div>
  );

  const renderDetailPanel = () => {
    if (!selectedTemplate) {
      return (
        <div className="detail-panel-empty">
          <div className="empty-icon">📋</div>
          <h3>选择一个游戏模板</h3>
          <p>点击左侧的游戏模板查看详细信息</p>
        </div>
      );
    }

    return (
      <div className="detail-panel">
        <div className="detail-header">
          <div className="detail-thumbnail">
            <span className="detail-emoji">{selectedTemplate.thumbnail}</span>
          </div>
          <div className="detail-title-section">
            <h2 className="detail-title">{selectedTemplate.name}</h2>
            <p className="detail-subtitle">{selectedTemplate.description}</p>
            <div className="detail-version">v{selectedTemplate.version} by {selectedTemplate.author}</div>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>游戏规则</h3>
            <div className="rules-summary">
              <strong>概要：</strong> {selectedTemplate.rules.summary}
            </div>
            {selectedTemplate.rules.quickStart && (
              <div className="rules-quickstart">
                <strong>快速上手：</strong> {selectedTemplate.rules.quickStart}
              </div>
            )}
            <details className="rules-full">
              <summary>详细规则</summary>
              <div className="rules-text">
                {selectedTemplate.rules.fullText.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </details>
          </div>

          <div className="detail-section">
            <h3>游戏信息</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">玩家数量</span>
                <span className="info-value">
                  {selectedTemplate.minPlayers === selectedTemplate.maxPlayers 
                    ? `${selectedTemplate.minPlayers}人` 
                    : `${selectedTemplate.minPlayers}-${selectedTemplate.maxPlayers}人`}
                  {selectedTemplate.optimalPlayers && (
                    <span className="optimal"> (推荐{selectedTemplate.optimalPlayers}人)</span>
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">游戏时长</span>
                <span className="info-value">{selectedTemplate.estimatedTime}分钟</span>
              </div>
              <div className="info-item">
                <span className="info-label">设置时间</span>
                <span className="info-value">{selectedTemplate.setupTime || 0}分钟</span>
              </div>
              <div className="info-item">
                <span className="info-label">难度等级</span>
                <span className={`info-value difficulty-${selectedTemplate.difficulty}`}>
                  {getDifficultyLabel(selectedTemplate.difficulty)} ({selectedTemplate.complexity}/10)
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>功能特性</h3>
            <div className="features-grid">
              {Object.entries(selectedTemplate.features).map(([key, value]) => (
                <div key={key} className={`feature-item ${value ? 'enabled' : 'disabled'}`}>
                  <span className="feature-icon">{value ? '✓' : '✗'}</span>
                  <span className="feature-label">{getFeatureLabel(key)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>游戏组件</h3>
            <div className="components-list">
              {selectedTemplate.components.map(component => (
                <div key={component.id} className="component-item">
                  <span className="component-type">{getComponentTypeIcon(component.type)}</span>
                  <div className="component-info">
                    <div className="component-name">{component.name}</div>
                    {component.description && (
                      <div className="component-desc">{component.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => handleStartGame(selectedTemplate.id)}
            >
              开始游戏
            </button>
            <button className="btn btn-outline">收藏</button>
            <button className="btn btn-outline">分享</button>
          </div>
        </div>
      </div>
    );
  };

  // === 辅助函数 ===
  const getDifficultyLabel = (difficulty: string): string => {
    const labels = {
      'beginner': '入门',
      'easy': '简单',
      'medium': '中等',
      'hard': '困难',
      'expert': '专家'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  };

  const getFeatureLabel = (feature: string): string => {
    const labels = {
      'aiSupport': 'AI支持',
      'spectatorMode': '观战模式',
      'realTimePlay': '实时游戏',
      'pauseResume': '暂停恢复',
      'replaySystem': '回放系统',
      'statistics': '统计功能',
      'customization': '自定义'
    };
    return labels[feature as keyof typeof labels] || feature;
  };

  const getComponentTypeIcon = (type: string): string => {
    const icons = {
      'board': '🏁',
      'cards': '🃏',
      'dice': '🎲',
      'tokens': '🔘',
      'timer': '⏱️',
      'score': '📊',
      'custom': '⚙️'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="template-manage-page page-with-navbar">
      {/* 🧭 面包屑导航 */}
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
        <span className="breadcrumb-current">模板管理</span>
      </div>

      {/* 🔍 调试信息面板 */}
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <strong>🔍 调试信息:</strong><br />
        模板数量: {templates.length}<br />
        加载状态: {loading ? '加载中...' : '已完成'}<br />
        过滤后数量: {filteredAndSortedTemplates.length}<br />
        搜索词: "{searchQuery}"<br />
        分类筛选: {filterCategory}<br />
        难度筛选: {filterDifficulty}
      </div>

      <div className="page-container">
        {/* 页面头部 */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              🎮 游戏模板库
            </h1>
            <p className="page-subtitle">
              发现和管理桌游模板，创造无限乐趣
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => setShowImportDialog(true)}
              disabled={showImportDialog}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              导入模板
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateDialog(true)}
              disabled={showCreateDialog}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              创建模板
            </button>
          </div>
        </div>

        <div className="content-layout">
          {/* 侧边栏 - 过滤器和模板列表 */}
          <div className="sidebar">
            {/* 搜索和筛选 */}
            <div className="filters-section">
              <div className="search-box">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                </svg>
                <input
                  type="text"
                  placeholder="搜索游戏模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="filter-groups">
                <div className="filter-group">
                  <label className="filter-label">分类</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                    className="filter-select"
                  >
                    <option value="all">全部分类</option>
                    <option value="strategy">策略</option>
                    <option value="party">派对</option>
                    <option value="card">纸牌</option>
                    <option value="dice">骰子</option>
                    <option value="puzzle">解谜</option>
                    <option value="action">动作</option>
                    <option value="simulation">模拟</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">难度</label>
                  <select 
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value as FilterDifficulty)}
                    className="filter-select"
                  >
                    <option value="all">全部难度</option>
                    <option value="beginner">入门</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                    <option value="expert">专家</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 排序和视图 */}
            <div className="controls-section">
              <div className="sort-controls">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="sort-select"
                >
                  <option value="rating">评分</option>
                  <option value="downloads">下载量</option>
                  <option value="name">名称</option>
                  <option value="updated">更新时间</option>
                  <option value="difficulty">难度</option>
                </select>
                
                <button 
                  className={`sort-order ${sortOrder}`}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={sortOrder === 'asc' ? '升序' : '降序'}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    {sortOrder === 'asc' ? (
                      <path d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"/>
                    ) : (
                      <path d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"/>
                    )}
                  </svg>
                </button>
              </div>

              <div className="view-controls">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="网格视图"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,4V8H14V4H10M16,4V8H20V4H16M16,10V14H20V10H16M16,16V20H20V16H16M14,20V16H10V20H14M8,20V16H4V20H8M8,14V10H4V14H8M8,8V4H4V8H8M10,14H14V10H10V14Z"/>
                  </svg>
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="列表视图"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 模板列表 */}
            <div className="templates-section">
              <div className="section-header">
                <h3>模板列表 ({filteredAndSortedTemplates.length})</h3>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <span>加载模板中...</span>
                </div>
              ) : filteredAndSortedTemplates.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h4>没有找到匹配的模板</h4>
                  <p>尝试调整搜索条件或筛选器</p>
                </div>
              ) : (
                <div className={`templates-container ${viewMode}`}>
                  {viewMode === 'grid' 
                    ? filteredAndSortedTemplates.map(renderTemplateCard)
                    : filteredAndSortedTemplates.map(renderTemplateList)
                  }
                </div>
              )}
            </div>
          </div>

          {/* 主内容区域 - 详情面板 */}
          <div className="main-content">
            {renderDetailPanel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagePage; 