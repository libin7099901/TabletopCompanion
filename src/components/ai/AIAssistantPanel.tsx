import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../../types/common';
import { GameTemplate, GameState } from '../../services/gameTemplate/GameTemplateEngine';
import AIAssistantService, { AIResponse, GameHint, AIAssistantConfig } from '../../services/ai/AIAssistantService';

interface AIAssistantPanelProps {
  gameTemplate?: GameTemplate;
  gameState?: GameState;
  currentPlayer?: Player;
  isVisible: boolean;
  onClose: () => void;
  config?: Partial<AIAssistantConfig>;
}

interface ConversationItem {
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  confidence?: number;
  suggestedActions?: string[];
  relatedRules?: string[];
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  gameTemplate,
  gameState,
  currentPlayer,
  isVisible,
  onClose,
  config
}) => {
  const [aiService] = useState(() => new AIAssistantService(config));
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [hints, setHints] = useState<GameHint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // 初始化AI知识库
  useEffect(() => {
    if (gameTemplate) {
      aiService.updateGameKnowledge(gameTemplate);
    }
  }, [gameTemplate, aiService]);

  // 获取游戏提示
  useEffect(() => {
    if (gameState && gameTemplate && currentPlayer && showHints) {
      const fetchHints = async () => {
        try {
          const newHints = await aiService.getGameHints(gameState, gameTemplate, currentPlayer);
          setHints(newHints);
        } catch (error) {
          console.error('获取游戏提示失败:', error);
        }
      };
      fetchHints();
    }
  }, [gameState, gameTemplate, currentPlayer, showHints, aiService]);

  // 初始欢迎消息
  useEffect(() => {
    if (conversation.length === 0) {
      setConversation([{
        type: 'ai',
        content: '您好！我是您的桌游AI助手。我可以为您解答游戏规则、提供策略建议、分析游戏状态等。请问有什么可以帮助您的吗？',
        timestamp: Date.now()
      }]);
    }
  }, [conversation.length]);

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: ConversationItem = {
      type: 'user',
      content: query,
      timestamp: Date.now()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery('');

    try {
      const response: AIResponse = await aiService.queryRules(query, gameTemplate, gameState);
      
      const aiMessage: ConversationItem = {
        type: 'ai',
        content: response.response,
        timestamp: Date.now(),
        confidence: response.confidence,
        suggestedActions: response.suggestedActions,
        relatedRules: response.relatedRules
      };

      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ConversationItem = {
        type: 'ai',
        content: '抱歉，处理您的问题时出现了错误。请稍后再试。',
        timestamp: Date.now(),
        confidence: 0
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (quickQuery: string) => {
    setQuery(quickQuery);
  };

  const dismissHint = (index: number) => {
    setHints(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHintIcon = (type: GameHint['type']) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'suggestion':
        return '💡';
      case 'rule_reminder':
        return '📋';
      case 'strategy_tip':
        return '🎯';
      default:
        return 'ℹ️';
    }
  };

  const getHintColor = (priority: GameHint['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const quickQueries = [
    '游戏规则是什么？',
    '我现在可以做什么？',
    '怎么计分？',
    '有什么策略建议？',
    '游戏怎么结束？'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">AI游戏助手</h2>
              <p className="text-sm text-gray-600">
                {gameTemplate ? `正在协助：${gameTemplate.name}` : '等待游戏开始'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              data-testid="ai-close-button"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 对话区域 */}
          <div className="flex-1 flex flex-col">
            {/* 游戏提示 */}
            {hints.length > 0 && showHints && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-700">实时提示</h3>
                  <button
                    onClick={() => setShowHints(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    隐藏提示
                  </button>
                </div>
                <div className="space-y-2">
                  {hints.map((hint, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getHintColor(hint.priority)} relative`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">{getHintIcon(hint.type)}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{hint.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{hint.message}</div>
                        </div>
                        <button
                          onClick={() => dismissHint(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 对话历史 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((item, index) => (
                <div key={index} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    item.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  } rounded-lg p-3 shadow-sm`}>
                    <div className="text-sm">{item.content}</div>
                    
                    {/* AI消息的额外信息 */}
                    {item.type === 'ai' && (
                      <div className="mt-2 space-y-2">
                        {item.confidence !== undefined && (
                          <div className="text-xs opacity-70">
                            置信度: {Math.round(item.confidence * 100)}%
                          </div>
                        )}
                        
                        {item.suggestedActions && item.suggestedActions.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium mb-1">建议动作:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {item.suggestedActions.map((action, idx) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.relatedRules && item.relatedRules.length > 0 && (
                          <div className="text-xs">
                            <div className="font-medium mb-1">相关规则:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {item.relatedRules.map((rule, idx) => (
                                <li key={idx}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      <span className="text-sm text-gray-600">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="border-t border-gray-200 p-4">
              {/* 快速查询按钮 */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">快速查询:</div>
                <div className="flex flex-wrap gap-2">
                  {quickQueries.map((quickQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuery(quickQuery)}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {quickQuery}
                    </button>
                  ))}
                </div>
              </div>

              {/* 查询输入框 */}
              <form onSubmit={handleSubmitQuery} className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="输入您的问题..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  发送
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel; 