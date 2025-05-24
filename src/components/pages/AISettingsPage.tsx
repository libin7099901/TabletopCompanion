// 🤖 AI设置页面 - 现代化重构版

import React, { useState, useEffect } from 'react';
import { OllamaService, OllamaModel } from '../../services/OllamaService';
import './AISettingsPage.css';

interface AISettingsPageProps {
  onBack: () => void;
}

interface AIConfig {
  provider: 'local' | 'openai' | 'claude' | 'custom';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enabled: boolean;
}

interface LocalAIConfig {
  modelPath?: string;
  port?: number;
  enabled: boolean;
  autoStart: boolean;
  selectedModel?: string;
}

const AI_PROVIDERS = [
  {
    id: 'local',
    name: '本地AI (Ollama)',
    description: '使用本地部署的Ollama AI模型，提供隐私保护和快速响应',
    icon: '🏠',
    status: 'recommended',
    features: ['隐私安全', '离线可用', '免费使用', '快速响应']
  },
  {
    id: 'openai',
    name: 'OpenAI GPT',
    description: '使用OpenAI的GPT模型，提供强大的对话和推理能力',
    icon: '🚀',
    status: 'stable',
    features: ['功能强大', '稳定可靠', '持续更新', '全球可用']
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: '使用Anthropic的Claude模型，擅长分析和安全对话',
    icon: '🎭',
    status: 'stable',
    features: ['安全可靠', '逻辑清晰', '友好对话', '精准分析']
  },
  {
    id: 'custom',
    name: '自定义API',
    description: '配置自定义的AI API端点，支持兼容OpenAI格式的服务',
    icon: '⚙️',
    status: 'advanced',
    features: ['高度自定义', '灵活配置', '兼容多种服务', '个性化选择']
  }
];

const OPENAI_MODELS = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '最新的GPT-4模型，性能和速度的完美平衡' },
  { id: 'gpt-4', name: 'GPT-4', description: '最强大的GPT模型，适合复杂任务' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '快速且经济的选择' },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: '支持更长的上下文长度' }
];

const CLAUDE_MODELS = [
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: '最强大的Claude模型' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: '平衡性能和成本' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: '快速响应的轻量版本' }
];

const AISettingsPage: React.FC<AISettingsPageProps> = ({ onBack }) => {
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'local',
    enabled: true,
    temperature: 0.7,
    maxTokens: 2048
  });

  const [localConfig, setLocalConfig] = useState<LocalAIConfig>({
    port: 11434,
    enabled: true,
    autoStart: false
  });

  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'connected' | 'failed'>('unknown');
  const [testResults, setTestResults] = useState<string>('');
  const [ollamaService, setOllamaService] = useState<OllamaService | null>(null);
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [activeSection, setActiveSection] = useState<'provider' | 'config' | 'test' | 'features'>('provider');

  // Toast状态管理
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // 显示Toast提示
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({
      isVisible: true,
      message,
      type
    });
    
    // 自动隐藏
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // 关闭Toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    loadSettings();
    // 初始化Ollama服务
    const service = new OllamaService(`http://localhost:${localConfig.port}`);
    setOllamaService(service);
  }, []);

  useEffect(() => {
    // 当端口改变时更新Ollama服务
    if (ollamaService && localConfig.port) {
      ollamaService.updateBaseUrl(`http://localhost:${localConfig.port}`);
    }
  }, [localConfig.port, ollamaService]);

  const loadSettings = () => {
    try {
      const savedAIConfig = localStorage.getItem('aiConfig');
      const savedLocalConfig = localStorage.getItem('localAIConfig');
      
      if (savedAIConfig) {
        setAiConfig(JSON.parse(savedAIConfig));
      }
      
      if (savedLocalConfig) {
        setLocalConfig(JSON.parse(savedLocalConfig));
      }
    } catch (error) {
      console.error('加载AI设置失败:', error);
      showToast('加载设置失败，使用默认配置', 'warning');
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('aiConfig', JSON.stringify(aiConfig));
      localStorage.setItem('localAIConfig', JSON.stringify(localConfig));
      showToast('设置已保存！', 'success');
    } catch (error) {
      console.error('保存AI设置失败:', error);
      showToast('保存设置失败，请检查浏览器存储权限', 'error');
    }
  };

  const resetSettings = () => {
    if (confirm('确定要重置所有AI设置吗？此操作无法撤销。')) {
      const defaultAIConfig: AIConfig = {
        provider: 'local',
        enabled: true,
        temperature: 0.7,
        maxTokens: 2048
      };
      
      const defaultLocalConfig: LocalAIConfig = {
        port: 11434,
        enabled: true,
        autoStart: false
      };
      
      setAiConfig(defaultAIConfig);
      setLocalConfig(defaultLocalConfig);
      setConnectionStatus('unknown');
      setTestResults('');
      
      showToast('设置已重置为默认值', 'info');
    }
  };

  // 获取Ollama模型列表
  const loadOllamaModels = async () => {
    if (!ollamaService) return;

    setLoadingModels(true);
    setTestResults('正在获取模型列表...');

    try {
      const models = await ollamaService.getModels();
      setAvailableModels(models);
      setTestResults(`✅ 找到 ${models.length} 个可用模型`);
      
      // 如果没有选择模型且有可用模型，自动选择第一个
      if (!localConfig.selectedModel && models.length > 0) {
        setLocalConfig(prev => ({ 
          ...prev, 
          selectedModel: models[0].name 
        }));
      }
    } catch (error) {
      setTestResults(`❌ 获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const testConnection = async () => {
    if (!ollamaService) return;

    setConnectionStatus('testing');
    setTestResults('正在测试连接...');

    try {
      // 1. 检查服务连接
      const connectionCheck = await ollamaService.checkConnection();
      if (!connectionCheck.connected) {
        throw new Error(connectionCheck.error || '服务连接失败');
      }

      setTestResults(`🔗 Ollama服务连接成功 (版本: ${connectionCheck.version})\n正在获取模型列表...`);

      // 2. 获取模型列表
      await loadOllamaModels();

      // 3. 测试选定的模型
      if (localConfig.selectedModel) {
        setTestResults(prev => prev + '\n正在测试模型...');
        const modelTest = await ollamaService.testModel(localConfig.selectedModel);
        
        if (modelTest.success) {
          setConnectionStatus('connected');
          setTestResults(prev => prev + `\n✅ 模型测试成功！\n回复: ${modelTest.response}`);
        } else {
          throw new Error(`模型测试失败: ${modelTest.error}`);
        }
      } else {
        setConnectionStatus('connected');
        setTestResults(prev => prev + '\n⚠️ 请选择一个模型进行测试');
      }

    } catch (error) {
      setConnectionStatus('failed');
      setTestResults(`❌ 连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const renderProviderCard = (provider: typeof AI_PROVIDERS[0]) => (
    <div
      key={provider.id}
      className={`provider-card ${aiConfig.provider === provider.id ? 'selected' : ''}`}
      onClick={() => setAiConfig(prev => ({ ...prev, provider: provider.id as any }))}
      data-testid={`provider-${provider.id}`}
    >
      <div className="provider-header">
        <div className="provider-icon">{provider.icon}</div>
        <div className={`provider-status status--${provider.status}`}>
          {provider.status === 'stable' ? '稳定' : 
           provider.status === 'recommended' ? '推荐' : 
           provider.status === 'beta' ? '测试版' : '高级'}
        </div>
      </div>
      
      <div className="provider-content">
        <h4 className="provider-name">{provider.name}</h4>
        <p className="provider-description">{provider.description}</p>
        
        <div className="provider-features">
          {provider.features.map((feature, index) => (
            <span key={index} className="feature-tag">{feature}</span>
          ))}
        </div>
      </div>
      
      {aiConfig.provider === provider.id && (
        <div className="selected-indicator">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
      )}
    </div>
  );

  const renderProviderConfig = () => {
    switch (aiConfig.provider) {
      case 'local':
        return (
          <div className="config-section">
            <div className="section-header">
              <h4 className="section-title">本地AI配置 (Ollama)</h4>
              <p className="section-description">配置本地Ollama服务的连接参数</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  服务端口
                  <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={localConfig.port}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 11434 }))}
                  className="form-input"
                  placeholder="11434"
                  min="1024"
                  max="65535"
                />
                <div className="input-hint">
                  Ollama服务运行的端口号（默认: 11434）
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">连接状态</label>
                <div className="status-display">
                  <div className={`status-indicator status--${connectionStatus}`}>
                    <div className="status-dot"></div>
                    <span className="status-text">
                      {connectionStatus === 'connected' ? '已连接' : 
                       connectionStatus === 'failed' ? '连接失败' : 
                       connectionStatus === 'testing' ? '测试中' : '未测试'}
                    </span>
                  </div>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing'}
                  >
                    {connectionStatus === 'testing' ? '测试中...' : '测试连接'}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">可用模型</label>
              <div className="model-selection">
                <div className="model-controls">
                  <select
                    value={localConfig.selectedModel || ''}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, selectedModel: e.target.value }))}
                    className="form-select"
                    disabled={availableModels.length === 0}
                  >
                    <option value="">
                      {availableModels.length === 0 ? '请先测试连接获取模型' : '请选择模型'}
                    </option>
                    {availableModels.map(model => (
                      <option key={model.name} value={model.name}>
                        {model.name} {model.isThinkingModel ? '🧠' : '🤖'}
                        {model.details?.parameter_size ? ` (${model.details.parameter_size})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={loadOllamaModels}
                    disabled={loadingModels || connectionStatus !== 'connected'}
                  >
                    {loadingModels ? '获取中...' : '刷新列表'}
                  </button>
                </div>
                {availableModels.length > 0 && (
                  <div className="model-info">
                    <span className="model-count">找到 {availableModels.length} 个可用模型</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'openai':
        return (
          <div className="config-section">
            <div className="section-header">
              <h4 className="section-title">OpenAI配置</h4>
              <p className="section-description">配置您的OpenAI API密钥和模型选择</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  API密钥
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={aiConfig.apiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="form-input"
                  placeholder="sk-..."
                />
                <div className="input-hint">
                  从OpenAI控制台获取您的API密钥。
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="link">
                    获取API密钥
                  </a>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">模型选择</label>
                <select
                  value={aiConfig.model || 'gpt-3.5-turbo'}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="form-select"
                >
                  {OPENAI_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'claude':
        return (
          <div className="config-section">
            <div className="section-header">
              <h4 className="section-title">Anthropic Claude配置</h4>
              <p className="section-description">配置您的Claude API密钥和模型选择</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  API密钥
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={aiConfig.apiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="form-input"
                  placeholder="sk-ant-..."
                />
                <div className="input-hint">
                  从Anthropic控制台获取您的API密钥。
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="link">
                    获取API密钥
                  </a>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">模型选择</label>
                <select
                  value={aiConfig.model || 'claude-3-sonnet-20240229'}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="form-select"
                >
                  {CLAUDE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="config-section">
            <div className="section-header">
              <h4 className="section-title">自定义API配置</h4>
              <p className="section-description">配置兼容OpenAI格式的自定义API服务</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  API URL
                  <span className="required">*</span>
                </label>
                <input
                  type="url"
                  value={aiConfig.apiUrl || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                  className="form-input"
                  placeholder="https://api.example.com/v1"
                />
                <div className="input-hint">
                  API服务的基础URL，应当兼容OpenAI API格式
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">API密钥</label>
                <input
                  type="password"
                  value={aiConfig.apiKey || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="form-input"
                  placeholder="your-api-key"
                />
                <div className="input-hint">
                  API访问密钥（如果服务需要的话）
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">模型名称</label>
                <input
                  type="text"
                  value={aiConfig.model || ''}
                  onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="form-input"
                  placeholder="custom-model"
                />
                <div className="input-hint">
                  自定义模型的名称或标识符
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="ai-settings-page" data-testid="ai-settings-page">
      {/* 🧭 导航栏 */}
      <nav className="main-navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎲</div>
          <span className="navbar-app-name">桌游伴侣</span>
        </div>
        
        <div className="navbar-user">
          <div className="user-avatar">🤖</div>
          <span className="user-name">AI设置</span>
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
          <span className="breadcrumb-current">AI设置</span>
        </div>

        {/* 🎯 页面头部 */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">AI助手设置</h1>
            <p className="page-subtitle">配置您的AI助手，获得更智能的游戏体验和个性化指导</p>
          </div>
        </div>

        {/* 📍 导航标签 */}
        <div className="section-navigation">
          <button 
            className={`nav-tab ${activeSection === 'provider' ? 'active' : ''}`}
            onClick={() => setActiveSection('provider')}
          >
            <span className="nav-icon">🤖</span>
            <span className="nav-text">AI提供商</span>
          </button>
          <button 
            className={`nav-tab ${activeSection === 'config' ? 'active' : ''}`}
            onClick={() => setActiveSection('config')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">配置设置</span>
          </button>
          <button 
            className={`nav-tab ${activeSection === 'test' ? 'active' : ''}`}
            onClick={() => setActiveSection('test')}
          >
            <span className="nav-icon">🔌</span>
            <span className="nav-text">连接测试</span>
          </button>
          <button 
            className={`nav-tab ${activeSection === 'features' ? 'active' : ''}`}
            onClick={() => setActiveSection('features')}
          >
            <span className="nav-icon">🎛️</span>
            <span className="nav-text">功能设置</span>
          </button>
        </div>

        {/* 📝 设置内容 */}
        <div className="settings-content">
          {/* AI提供商选择 */}
          {activeSection === 'provider' && (
            <div className="settings-section" data-testid="provider-section">
              <div className="section-header">
                <h3 className="section-title">选择AI提供商</h3>
                <p className="section-description">
                  选择您想要使用的AI服务。本地AI提供更好的隐私保护，云端AI提供更强的功能。
                </p>
              </div>

              <div className="providers-grid">
                {AI_PROVIDERS.map(renderProviderCard)}
              </div>
            </div>
          )}

          {/* 配置设置 */}
          {activeSection === 'config' && (
            <div className="settings-section" data-testid="config-section">
              <div className="section-header">
                <h3 className="section-title">配置设置</h3>
                <p className="section-description">
                  配置您选择的AI服务的具体参数和连接信息。
                </p>
              </div>

              {renderProviderConfig()}

              {/* 通用模型参数 */}
              <div className="config-section">
                <div className="section-header">
                  <h4 className="section-title">模型参数</h4>
                  <p className="section-description">调整AI模型的行为参数以获得最佳效果</p>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      温度 (Temperature)
                      <span className="param-value">{aiConfig.temperature?.toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiConfig.temperature || 0.7}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="form-range"
                    />
                    <div className="range-labels">
                      <span>保守 (0)</span>
                      <span>平衡 (1)</span>
                      <span>创造性 (2)</span>
                    </div>
                    <div className="input-hint">
                      控制AI回复的创造性和随机性。较低的值会产生更一致和保守的回复，较高的值会产生更有创意但可能不太一致的回复。
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">最大令牌数</label>
                    <input
                      type="number"
                      value={aiConfig.maxTokens || 2048}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                      className="form-input"
                      min="100"
                      max="4096"
                      step="256"
                    />
                    <div className="input-hint">
                      限制AI回复的最大长度。较高的值允许更长的回复，但可能增加处理时间和成本。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 连接测试 */}
          {activeSection === 'test' && (
            <div className="settings-section" data-testid="test-section">
              <div className="section-header">
                <h3 className="section-title">连接测试</h3>
                <p className="section-description">
                  测试与AI服务的连接状态，确保配置正确。
                </p>
              </div>

              <div className="test-panel">
                <div className="test-controls">
                  <button
                    className="btn btn--primary btn--lg"
                    onClick={testConnection}
                    disabled={connectionStatus === 'testing' || aiConfig.provider !== 'local'}
                  >
                    {connectionStatus === 'testing' ? '测试中...' : '开始测试'}
                  </button>
                  
                  {aiConfig.provider !== 'local' && (
                    <div className="test-note">
                      <span className="note-icon">ℹ️</span>
                      <span>连接测试目前仅支持本地Ollama服务</span>
                    </div>
                  )}
                </div>

                <div className="test-results-container">
                  <div className="results-header">
                    <h4>测试结果</h4>
                    {testResults && (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => setTestResults('')}
                      >
                        清除结果
                      </button>
                    )}
                  </div>
                  
                  <div className="test-results">
                    {testResults ? (
                      <pre className="results-text">{testResults}</pre>
                    ) : (
                      <div className="no-results">
                        <span className="no-results-icon">📋</span>
                        <p>运行连接测试后，结果将在此处显示</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 功能设置 */}
          {activeSection === 'features' && (
            <div className="settings-section" data-testid="features-section">
              <div className="section-header">
                <h3 className="section-title">功能设置</h3>
                <p className="section-description">
                  启用或禁用特定的AI功能，自定义您的使用体验。
                </p>
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <label className="toggle-option">
                    <input
                      type="checkbox"
                      checked={aiConfig.enabled}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    <span className="toggle-slider"></span>
                    <div className="toggle-content">
                      <div className="toggle-header">
                        <span className="toggle-icon">🤖</span>
                        <span className="toggle-title">启用AI助手</span>
                      </div>
                      <p className="toggle-description">
                        在游戏中显示AI聊天面板，提供规则解释、策略建议和游戏指导。
                        关闭后AI助手按钮将不会显示。
                      </p>
                    </div>
                  </label>
                </div>

                {aiConfig.provider === 'local' && (
                  <>
                    <div className="feature-card">
                      <label className="toggle-option">
                        <input
                          type="checkbox"
                          checked={localConfig.enabled}
                          onChange={(e) => setLocalConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        />
                        <span className="toggle-slider"></span>
                        <div className="toggle-content">
                          <div className="toggle-header">
                            <span className="toggle-icon">🏠</span>
                            <span className="toggle-title">本地AI优先</span>
                          </div>
                          <p className="toggle-description">
                            当本地Ollama服务可用时，优先使用本地AI模型而不是云端服务。
                            这可以提供更快的响应速度和更好的隐私保护。
                          </p>
                        </div>
                      </label>
                    </div>

                    <div className="feature-card">
                      <label className="toggle-option">
                        <input
                          type="checkbox"
                          checked={localConfig.autoStart}
                          onChange={(e) => setLocalConfig(prev => ({ ...prev, autoStart: e.target.checked }))}
                        />
                        <span className="toggle-slider"></span>
                        <div className="toggle-content">
                          <div className="toggle-header">
                            <span className="toggle-icon">🚀</span>
                            <span className="toggle-title">自动启动本地服务</span>
                          </div>
                          <p className="toggle-description">
                            应用启动时自动尝试启动Ollama服务。
                            需要确保您的系统中已安装Ollama。
                          </p>
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 💾 操作按钮 */}
        <div className="settings-footer">
          <button 
            className="btn btn--outline btn--lg"
            onClick={resetSettings}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
            </svg>
            重置设置
          </button>
          <button 
            className="btn btn--primary btn--lg"
            onClick={saveSettings}
            data-testid="save-settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
            保存设置
          </button>
        </div>
      </div>

      {/* 🔔 Toast提示 */}
      {toast.isVisible && (
        <div className={`toast-notification toast--${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✅' : 
               toast.type === 'error' ? '❌' : 
               toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={hideToast}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AISettingsPage; 