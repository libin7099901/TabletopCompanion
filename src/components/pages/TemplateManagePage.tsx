import React, { useState, useEffect } from 'react';
import { TemplateService } from '../../services/TemplateService';
import { GameTemplate } from '../../types/common';
import './TemplateManagePage.css';

interface TemplateManagePageProps {
  onBack?: () => void;
  onBackToHome?: () => void;
}

const TemplateManagePage: React.FC<TemplateManagePageProps> = ({ 
  onBack, 
  onBackToHome 
}) => {
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // 确定使用哪个回调函数
  const handleBack = onBackToHome || onBack || (() => {});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const templateService = TemplateService.getInstance();
    const localTemplates = templateService.getLocalTemplates();
    setTemplates(localTemplates);
  };

  const createSampleTemplate = () => {
    const templateService = TemplateService.getInstance();
    const sampleTemplate = templateService.createSampleTemplate();
    setTemplates(prev => [...prev, sampleTemplate]);
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('确定要删除这个模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
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
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  return (
    <div className="template-manage-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBack}>
          ← 返回主页
        </button>
        <h1 className="page-title">模板管理</h1>
        <div className="header-actions">
          <button className="action-button secondary" onClick={() => setShowImportDialog(true)}>
            导入模板
          </button>
          <button className="action-button primary" onClick={createSampleTemplate}>
            创建示例模板
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="templates-section">
          <div className="section-header">
            <h2>我的模板 ({templates.length})</h2>
          </div>

          {templates.length > 0 ? (
            <div className="templates-grid">
              {templates.map(template => (
                <div 
                  key={template.id} 
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="template-thumbnail">
                    {template.metadata.thumbnail ? (
                      <img src={template.metadata.thumbnail} alt={template.name} />
                    ) : (
                      <div className="template-placeholder">🎲</div>
                    )}
                  </div>
                  <div className="template-info">
                    <h3 className="template-name">{template.name}</h3>
                    <p className="template-description">{template.description}</p>
                    <div className="template-meta">
                      <span className="players">{template.minPlayers}-{template.maxPlayers}人</span>
                      <span className="duration">{template.estimatedDuration}分钟</span>
                      <span className={`complexity ${template.metadata.complexity}`}>
                        {template.metadata.complexity === 'beginner' ? '入门' : 
                         template.metadata.complexity === 'intermediate' ? '中级' : '高级'}
                      </span>
                    </div>
                  </div>
                  <div className="template-actions">
                    <button 
                      className="action-btn edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: 实现编辑功能
                        alert('编辑功能待实现');
                      }}
                    >
                      编辑
                    </button>
                    <button 
                      className="action-btn duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateTemplate(template);
                      }}
                    >
                      复制
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(template.id);
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>还没有游戏模板</h3>
              <p>导入一些游戏模板，或者先从示例模板开始体验</p>
              <div className="empty-actions">
                <button className="action-button primary" onClick={createSampleTemplate}>
                  创建示例模板
                </button>
                <button className="action-button secondary" onClick={() => setShowImportDialog(true)}>
                  导入模板
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedTemplate && (
          <div className="template-details">
            <div className="details-header">
              <h3>模板详情</h3>
              <button className="close-details" onClick={() => setSelectedTemplate(null)}>×</button>
            </div>
            <div className="details-content">
              <div className="detail-section">
                <h4>基本信息</h4>
                <p><strong>名称：</strong>{selectedTemplate.name}</p>
                <p><strong>描述：</strong>{selectedTemplate.description}</p>
                <p><strong>玩家数：</strong>{selectedTemplate.minPlayers}-{selectedTemplate.maxPlayers}人</p>
                <p><strong>预计时长：</strong>{selectedTemplate.estimatedDuration}分钟</p>
                <p><strong>难度：</strong>
                  {selectedTemplate.metadata.complexity === 'beginner' ? '入门' : 
                   selectedTemplate.metadata.complexity === 'intermediate' ? '中级' : '高级'}
                </p>
              </div>
              
              <div className="detail-section">
                <h4>规则概述</h4>
                <p><strong>规则数量：</strong>{selectedTemplate.rules.length}条</p>
                {selectedTemplate.rules.length > 0 && (
                  <p><strong>主要规则：</strong>{selectedTemplate.rules[0].title}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>元数据</h4>
                <p><strong>作者：</strong>{selectedTemplate.metadata.author}</p>
                <p><strong>语言：</strong>{selectedTemplate.metadata.language}</p>
                <p><strong>类别：</strong>{selectedTemplate.metadata.category}</p>
                {selectedTemplate.metadata.tags && (
                  <p><strong>标签：</strong>{selectedTemplate.metadata.tags.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showImportDialog && (
        <div className="import-dialog-overlay" onClick={() => setShowImportDialog(false)}>
          <div className="import-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>导入模板</h3>
              <button className="close-dialog" onClick={() => setShowImportDialog(false)}>×</button>
            </div>
            <div className="dialog-content">
              <div className="import-options">
                <div className="import-option">
                  <h4>从文件导入</h4>
                  <p>选择本地的 JSON 格式模板文件</p>
                  <input type="file" accept=".json" onChange={(_e) => {
                    // TODO: 实现文件导入
                    alert('文件导入功能待实现');
                  }} />
                </div>
                <div className="import-option">
                  <h4>从URL导入</h4>
                  <p>输入在线模板的URL地址</p>
                  <input type="url" placeholder="https://example.com/template.json" />
                  <button className="import-btn" onClick={() => alert('URL导入功能待实现')}>
                    导入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManagePage; 