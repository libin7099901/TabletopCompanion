import React, { useState, useEffect } from 'react';
import { TemplateService } from '../../services/TemplateService';
import { GameTemplate } from '../../types/common';
import './TemplateManagePage.css';

interface TemplateManagePageProps {
  onBack?: () => void;
  onBackToHome?: () => void;
}

// 内置游戏模板
const BUILTIN_TEMPLATES: GameTemplate[] = [
  {
    id: 'gomoku',
    name: '五子棋',
    description: '经典的策略棋类游戏，先连成5个子获胜',
    version: '1.0.0',
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: 15,
    components: [],
    rules: [
      {
        id: 'rule1',
        title: '连珠获胜',
        description: '在横、竖、斜任意方向连成5个棋子即获胜',
        category: '获胜条件',
        priority: 1
      }
    ],
    metadata: {
      author: '系统内置',
      tags: ['策略', '棋类', '经典'],
      language: 'zh-CN',
      complexity: 'intermediate',
      category: '棋类游戏',
      thumbnail: '♟️'
    }
  },
  {
    id: 'card-compare',
    name: '比大小',
    description: '简单有趣的纸牌比较游戏，比较牌面大小决定胜负',
    version: '1.0.0',
    minPlayers: 2,
    maxPlayers: 4,
    estimatedDuration: 10,
    components: [],
    rules: [
      {
        id: 'rule1',
        title: '牌面比较',
        description: '每轮发牌后比较牌面大小，大牌获胜得分',
        category: '游戏规则',
        priority: 1
      }
    ],
    metadata: {
      author: '系统内置',
      tags: ['纸牌', '简单', '快速'],
      language: 'zh-CN',
      complexity: 'beginner',
      category: '纸牌游戏',
      thumbnail: '🃏'
    }
  },
  {
    id: 'dice-guess',
    name: '猜大小',
    description: '经典的骰子猜测游戏，预测骰子点数的大小',
    version: '1.0.0',
    minPlayers: 1,
    maxPlayers: 6,
    estimatedDuration: 8,
    components: [],
    rules: [
      {
        id: 'rule1',
        title: '猜测规则',
        description: '预测骰子总点数是大(>=7)还是小(<7)',
        category: '游戏规则',
        priority: 1
      }
    ],
    metadata: {
      author: '系统内置',
      tags: ['骰子', '运气', '简单'],
      language: 'zh-CN',
      complexity: 'beginner',
      category: '骰子游戏',
      thumbnail: '🎲'
    }
  }
];

const TemplateManagePage: React.FC<TemplateManagePageProps> = ({ 
  onBack, 
  onBackToHome 
}) => {
  const [userTemplates, setUserTemplates] = useState<GameTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'builtin' | 'user'>('builtin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterComplexity, setFilterComplexity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'players' | 'duration' | 'complexity'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 确定使用哪个回调函数
  const handleBack = onBackToHome || onBack || (() => {});

  useEffect(() => {
    loadUserTemplates();
  }, []);

  const loadUserTemplates = () => {
    const templateService = TemplateService.getInstance();
    const localTemplates = templateService.getLocalTemplates();
    setUserTemplates(localTemplates);
  };

  const createSampleTemplate = () => {
    const templateService = TemplateService.getInstance();
    const sampleTemplate = templateService.createSampleTemplate();
    setUserTemplates(prev => [...prev, sampleTemplate]);
    setActiveTab('user');
    setShowCreateDialog(false);
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('确定要删除这个模板吗？此操作无法撤销。')) {
      setUserTemplates(prev => prev.filter(t => t.id !== templateId));
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    }
  };

  const duplicateTemplate = (template: GameTemplate) => {
    const newTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (副本)`,
      metadata: {
        ...template.metadata,
        author: '用户自定义'
      }
    };
    setUserTemplates(prev => [...prev, newTemplate]);
    setActiveTab('user');
  };

  const exportTemplate = (template: GameTemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getFilteredTemplates = () => {
    const templates = activeTab === 'builtin' ? BUILTIN_TEMPLATES : userTemplates;
    
    return templates
      .filter(template => {
        // 搜索过滤
        if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !template.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !template.metadata.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
          return false;
        }
        
        // 复杂度过滤
        if (filterComplexity !== 'all' && template.metadata.complexity !== filterComplexity) {
          return false;
        }
        
        // 类别过滤
        if (filterCategory !== 'all' && template.metadata.category !== filterCategory) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'players':
            return a.minPlayers - b.minPlayers;
          case 'duration':
            return a.estimatedDuration - b.estimatedDuration;
          case 'complexity':
            const complexityOrder = { beginner: 0, intermediate: 1, advanced: 2 };
            return complexityOrder[a.metadata.complexity as keyof typeof complexityOrder] - 
                   complexityOrder[b.metadata.complexity as keyof typeof complexityOrder];
          default:
            return 0;
        }
      });
  };

  const getCategories = () => {
    const allTemplates = [...BUILTIN_TEMPLATES, ...userTemplates];
    const categories = new Set(allTemplates.map(t => t.metadata.category));
    return Array.from(categories);
  };

  const getComplexityName = (complexity: string) => {
    const names = {
      beginner: '入门',
      intermediate: '中级',
      advanced: '高级'
    };
    return names[complexity as keyof typeof names] || complexity;
  };

  const renderTemplateCard = (template: GameTemplate, isBuiltin: boolean = false) => (
    <div 
      key={template.id} 
      className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''} ${isBuiltin ? 'builtin' : 'user'} ${viewMode}`}
      onClick={() => setSelectedTemplate(template)}
      data-testid={`template-${template.id}`}
    >
      <div className="template-header">
        <div className="template-thumbnail">
          <div className="template-icon">{template.metadata.thumbnail || '🎲'}</div>
          {isBuiltin && <div className="builtin-badge">内置</div>}
        </div>
        <div className="template-meta-badges">
          <span className={`complexity-badge complexity--${template.metadata.complexity}`}>
            {getComplexityName(template.metadata.complexity)}
          </span>
        </div>
      </div>
      
      <div className="template-content">
        <h3 className="template-name">{template.name}</h3>
        <p className="template-description">{template.description}</p>
        
        <div className="template-stats">
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <span className="stat-text">{template.minPlayers}-{template.maxPlayers}人</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <span className="stat-text">{template.estimatedDuration}分钟</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <span className="stat-text">{template.rules.length}条规则</span>
          </div>
        </div>

        {template.metadata.tags && template.metadata.tags.length > 0 && (
          <div className="template-tags">
            {template.metadata.tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {template.metadata.tags.length > 3 && (
              <span className="tag more">+{template.metadata.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="template-actions">
        {isBuiltin ? (
          <div className="action-group">
            <button 
              className="action-btn action-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                duplicateTemplate(template);
              }}
              data-testid={`duplicate-${template.id}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              复制
            </button>
            <button 
              className="action-btn action-btn--outline"
              onClick={(e) => {
                e.stopPropagation();
                exportTemplate(template);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              导出
            </button>
          </div>
        ) : (
          <div className="action-group">
            <button 
              className="action-btn action-btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                alert('编辑功能待实现');
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              编辑
            </button>
            <button 
              className="action-btn action-btn--outline"
              onClick={(e) => {
                e.stopPropagation();
                duplicateTemplate(template);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              复制
            </button>
            <button 
              className="action-btn action-btn--outline"
              onClick={(e) => {
                e.stopPropagation();
                exportTemplate(template);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              导出
            </button>
            <button 
              className="action-btn action-btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                deleteTemplate(template.id);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="template-manage-page" data-testid="template-manage-page">
      {/* 🧭 导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎲</div>
          <span className="navbar-app-name">桌游伴侣</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-avatar">📋</div>
          <span className="user-name">模板管理</span>
        </div>
      </nav>

      <div className="page-container">
        {/* 🏠 面包屑导航 */}
        <div className="breadcrumb-nav">
          <button className="breadcrumb-item" onClick={handleBack}>
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

        {/* 🎯 页面头部 */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">游戏模板管理</h1>
            <p className="page-subtitle">管理您的游戏模板，创建和自定义专属的桌游体验</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn--outline btn--lg"
              onClick={() => setShowImportDialog(true)}
              data-testid="import-template-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              导入模板
            </button>
            <button 
              className="btn btn--primary btn--lg"
              onClick={() => setShowCreateDialog(true)}
              data-testid="create-template-btn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
              </svg>
              创建模板
            </button>
          </div>
        </div>

        {/* 🔍 搜索和筛选栏 */}
        <div className="filter-bar">
          <div className="search-section">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                type="text"
                placeholder="搜索模板名称、描述或标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                data-testid="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="filter-controls">
            <select 
              value={filterComplexity} 
              onChange={(e) => setFilterComplexity(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部难度</option>
              <option value="beginner">入门</option>
              <option value="intermediate">中级</option>
              <option value="advanced">高级</option>
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">全部类别</option>
              {getCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="name">按名称排序</option>
              <option value="players">按玩家数排序</option>
              <option value="duration">按时长排序</option>
              <option value="complexity">按难度排序</option>
            </select>

            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="网格视图"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,11H11V3H3M3,21H11V13H3M13,21H21V13H13M13,3V11H21V3"/>
                </svg>
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="列表视图"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,5H21V7H3V5M3,13V11H21V13H3M3,19V17H21V19H3Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 📂 主要内容区域 */}
        <div className="main-content">
          {/* 左侧：模板列表 */}
          <div className="templates-section">
            {/* 标签页 */}
            <div className="section-tabs">
              <button 
                className={`tab-button ${activeTab === 'builtin' ? 'active' : ''}`}
                onClick={() => setActiveTab('builtin')}
                data-testid="builtin-tab"
              >
                <span className="tab-icon">🎲</span>
                <span className="tab-text">内置模板</span>
                <span className="tab-count">({BUILTIN_TEMPLATES.length})</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
                data-testid="user-tab"
              >
                <span className="tab-icon">👤</span>
                <span className="tab-text">我的模板</span>
                <span className="tab-count">({userTemplates.length})</span>
              </button>
            </div>

            {/* 模板容器 */}
            <div className="templates-container">
              {getFilteredTemplates().length > 0 ? (
                <div className={`templates-display ${viewMode}`}>
                  {getFilteredTemplates().map(template => 
                    renderTemplateCard(template, activeTab === 'builtin')
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-content">
                    <div className="empty-icon">
                      {searchQuery ? '🔍' : (activeTab === 'builtin' ? '🎲' : '📦')}
                    </div>
                    <h3 className="empty-title">
                      {searchQuery ? '没有找到匹配的模板' : 
                       activeTab === 'builtin' ? '没有内置模板' : '还没有自定义模板'}
                    </h3>
                    <p className="empty-description">
                      {searchQuery ? '尝试调整搜索条件或筛选器' :
                       activeTab === 'builtin' ? '系统内置模板加载失败' : 
                       '创建或导入一些游戏模板来开始体验'}
                    </p>
                    {!searchQuery && activeTab === 'user' && (
                      <div className="empty-actions">
                        <button 
                          className="btn btn--primary btn--lg"
                          onClick={() => setShowCreateDialog(true)}
                        >
                          创建第一个模板
                        </button>
                        <button 
                          className="btn btn--outline btn--lg"
                          onClick={() => setShowImportDialog(true)}
                        >
                          导入模板
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：模板详情 */}
          {selectedTemplate && (
            <div className="template-details">
              <div className="details-header">
                <h3 className="details-title">模板详情</h3>
                <button 
                  className="close-details"
                  onClick={() => setSelectedTemplate(null)}
                  data-testid="close-details"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
              
              <div className="details-content">
                <div className="template-preview">
                  <div className="preview-header">
                    <div className="preview-icon">{selectedTemplate.metadata.thumbnail || '🎲'}</div>
                    <div className="preview-info">
                      <h4 className="preview-title">{selectedTemplate.name}</h4>
                      <p className="preview-author">作者: {selectedTemplate.metadata.author}</p>
                    </div>
                  </div>
                  <p className="preview-description">{selectedTemplate.description}</p>
                </div>

                <div className="detail-sections">
                  <div className="detail-section">
                    <h4 className="section-title">基本信息</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">玩家数量</span>
                        <span className="detail-value">{selectedTemplate.minPlayers}-{selectedTemplate.maxPlayers}人</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">预计时长</span>
                        <span className="detail-value">{selectedTemplate.estimatedDuration}分钟</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">游戏难度</span>
                        <span className={`detail-value complexity-badge complexity--${selectedTemplate.metadata.complexity}`}>
                          {getComplexityName(selectedTemplate.metadata.complexity)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">游戏类别</span>
                        <span className="detail-value">{selectedTemplate.metadata.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="section-title">游戏规则</h4>
                    <div className="rules-summary">
                      <p className="rules-count">共 {selectedTemplate.rules.length} 条规则</p>
                      {selectedTemplate.rules.length > 0 && (
                        <div className="rules-list">
                          {selectedTemplate.rules.map(rule => (
                            <div key={rule.id} className="rule-item">
                              <div className="rule-header">
                                <span className="rule-title">{rule.title}</span>
                                <span className="rule-category">{rule.category}</span>
                              </div>
                              <p className="rule-description">{rule.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4 className="section-title">标签和元数据</h4>
                    {selectedTemplate.metadata.tags && selectedTemplate.metadata.tags.length > 0 ? (
                      <div className="tags-container">
                        {selectedTemplate.metadata.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="no-tags">暂无标签</p>
                    )}
                    <div className="metadata-info">
                      <p><strong>语言:</strong> {selectedTemplate.metadata.language}</p>
                      <p><strong>版本:</strong> {selectedTemplate.version}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 导入对话框 */}
      {showImportDialog && (
        <div className="modal-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">导入游戏模板</h3>
              <button 
                className="modal-close"
                onClick={() => setShowImportDialog(false)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="import-zone">
                <div className="import-icon">📁</div>
                <h4>选择模板文件</h4>
                <p>支持 JSON 格式的模板文件</p>
                <input 
                  type="file" 
                  accept=".json" 
                  className="file-input"
                  id="template-file"
                />
                <label htmlFor="template-file" className="file-label">
                  选择文件
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn--outline btn--lg"
                onClick={() => setShowImportDialog(false)}
              >
                取消
              </button>
              <button className="btn btn--primary btn--lg">
                导入模板
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 创建对话框 */}
      {showCreateDialog && (
        <div className="modal-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">创建新模板</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateDialog(false)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="create-options">
                <div className="create-option" onClick={createSampleTemplate}>
                  <div className="option-icon">🎲</div>
                  <h4>创建示例模板</h4>
                  <p>快速创建一个示例模板，包含基本结构和示例内容</p>
                </div>
                <div className="create-option" onClick={() => alert('自定义创建功能待实现')}>
                  <div className="option-icon">✏️</div>
                  <h4>自定义创建</h4>
                  <p>从头开始创建，完全自定义模板的所有内容</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn--outline btn--lg"
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagePage; 