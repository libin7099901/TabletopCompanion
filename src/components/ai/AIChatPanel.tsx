// 🤖 AI聊天面板组件

import React, { useState, useEffect, useRef } from 'react';
import { AIAssistant, AIMessage, AIAssistantContext } from '../../services/AIAssistant';
import { GameState, GameTemplate } from '../../types/game';
import { Player } from '../../types/common';
import Button from '../ui/Button';
import Card from '../ui/Card';
import './AIChatPanel.css';

interface AIChatPanelProps {
  currentPlayer: Player;
  gameTemplate?: GameTemplate;
  gameState?: GameState;
  isVisible: boolean;
  onToggle: () => void;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  currentPlayer,
  gameTemplate,
  gameState,
  isVisible,
  onToggle
}) => {
  const [aiAssistant, setAiAssistant] = useState<AIAssistant | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 初始化AI助手
  useEffect(() => {
    const context: AIAssistantContext = {
      currentPlayer,
      gameTemplate,
      gameState,
      chatHistory: []
    };

    const assistant = new AIAssistant(context);
    setAiAssistant(assistant);

    // 添加欢迎消息
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'assistant',
      content: `👋 你好，${currentPlayer.name}！我是你的AI游戏助手。

我可以帮助你：
• 📖 解释游戏规则
• 🎯 提供策略建议  
• 📊 分析游戏状态
• 💡 回答任何问题

${gameTemplate ? `当前游戏：${gameTemplate.name}` : '选择游戏后我就能提供专业建议了！'}

有什么我可以帮助你的吗？`,
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);
  }, [currentPlayer, gameTemplate]);

  // 更新AI助手上下文
  useEffect(() => {
    if (aiAssistant) {
      aiAssistant.updateContext({
        gameTemplate,
        gameState,
        currentPlayer
      });
    }
  }, [aiAssistant, gameTemplate, gameState, currentPlayer]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !aiAssistant) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      await aiAssistant.sendMessage(userMessage);
      setMessages(aiAssistant.getChatHistory());
    } catch (error) {
      console.error('AI回复失败:', error);
      // 添加错误消息
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: '抱歉，AI助手暂时遇到问题，请稍后重试。',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!aiAssistant) return;

    const quickActions: Record<string, string> = {
      'rules': '请解释当前游戏的规则',
      'strategy': '给我一些策略建议',
      'status': '当前游戏状态如何？',
      'help': '你可以帮我做什么？'
    };

    const message = quickActions[action];
    if (message) {
      setInputMessage(message);
      // 稍微延迟，让用户看到输入框的内容
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    }
  };

  const renderMessage = (message: AIMessage) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <div
        key={message.id}
        className={`message ${isUser ? 'message-user' : isSystem ? 'message-system' : 'message-ai'}`}
      >
        <div className="message-avatar">
          {isUser ? '👤' : isSystem ? '🔔' : '🤖'}
        </div>
        <div className="message-content">
          <div className="message-text">
            {message.content.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                {index < message.content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          <div className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {message.gameContext?.suggestion && !isUser && (
            <div className="message-suggestion">
              💡 小贴士: {message.gameContext.suggestion}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isVisible) {
    return (
      <div className="ai-chat-toggle">
        <Button
          variant="primary"
          onClick={onToggle}
          className="chat-toggle-btn"
        >
          🤖 AI助手
        </Button>
      </div>
    );
  }

  return (
    <div className={`ai-chat-panel ${isMinimized ? 'minimized' : ''}`}>
      <Card variant="elevated" className="chat-container">
        {/* 聊天头部 */}
        <div className="chat-header">
          <div className="chat-title">
            <span className="ai-icon">🤖</span>
            <div>
              <h4>AI游戏助手</h4>
              <span className="chat-status">
                {isTyping ? '正在输入...' : '在线'}
              </span>
            </div>
          </div>
          <div className="chat-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="minimize-btn"
            >
              {isMinimized ? '📖' : '📖'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="close-btn"
            >
              ❌
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* 快捷操作按钮 */}
            <div className="quick-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('rules')}
              >
                📖 规则
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('strategy')}
              >
                🎯 策略
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('status')}
              >
                📊 状态
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('help')}
              >
                💡 帮助
              </Button>
            </div>

            {/* 消息列表 */}
            <div className="messages-container">
              {messages.map(renderMessage)}
              {isTyping && (
                <div className="message message-ai">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="chat-input-area">
              <div className="input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="输入消息...（按Enter发送）"
                  className="chat-input"
                  disabled={isTyping}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="send-btn"
                >
                  发送
                </Button>
              </div>
              <div className="input-hint">
                💡 尝试问："怎么玩这个游戏？" 或 "给我策略建议"
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default AIChatPanel; 