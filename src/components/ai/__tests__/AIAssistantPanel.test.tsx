import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AIAssistantPanel from '../AIAssistantPanel'
import { Player } from '../../../types/common'

// Mock AI服务
vi.mock('../../../services/ai/AIAssistantService', () => ({
  default: vi.fn(() => ({
    queryRules: vi.fn().mockResolvedValue({
      type: 'rules',
      query: 'test query',
      response: 'Test AI response',
      confidence: 0.9,
      suggestedActions: ['action1', 'action2'],
      relatedRules: ['rule1', 'rule2']
    }),
    getGameHints: vi.fn().mockResolvedValue([
      {
        type: 'suggestion',
        title: 'Test Hint',
        message: 'This is a test hint',
        priority: 'medium'
      }
    ]),
    updateGameKnowledge: vi.fn()
  }))
}))

describe('AIAssistantPanel', () => {
  const mockPlayer: Player = {
    id: 'test-player',
    name: 'Test Player',
    avatar: '👤',
    isHost: false,
    isConnected: true
  }

  const mockGameTemplate = {
    id: 'test-template',
    name: 'Test Game',
    description: 'A test game template',
    type: 'card' as const,
    version: '1.0.0',
    minPlayers: 2,
    maxPlayers: 4,
    estimatedDuration: 30,
    rules: {
      setup: { initialState: {}, playerSetup: [] },
      gameplay: {
        turnStructure: { order: 'clockwise' as const },
        phases: [],
        validMoves: [],
        specialRules: []
      },
      scoring: {
        scoreType: 'points' as const,
        scoreCalculation: [],
        bonuses: []
      },
      endConditions: [],
      actions: []
    },
    assets: { images: [] },
    metadata: {
      author: 'Test Author',
      created: '2024-01-01',
      lastModified: '2024-01-01',
      tags: ['test'],
      difficulty: 'easy' as const,
      category: ['test'],
      language: 'zh-CN'
    }
  }

  const mockGameState = {
    templateId: 'test-template',
    gameId: 'test-game',
    players: [],
    currentPlayer: 'test-player',
    currentPhase: 'play',
    turn: 1,
    scores: {},
    gameData: {},
    history: [],
    startTime: Date.now(),
    isFinished: false
  }

  const defaultProps = {
    gameTemplate: mockGameTemplate,
    gameState: mockGameState,
    currentPlayer: mockPlayer,
    isVisible: true,
    onClose: vi.fn(),
    config: {
      enableRuleQuery: true,
      enableGameHints: true,
      enableStrategyTips: true,
      hintFrequency: 'medium' as const,
      language: 'zh-CN' as const
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该在isVisible为true时渲染AI助手面板', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    expect(screen.getByText('AI游戏助手')).toBeInTheDocument()
    expect(screen.getByText('正在协助：Test Game')).toBeInTheDocument()
  })

  it('应该在isVisible为false时不渲染面板', () => {
    render(<AIAssistantPanel {...defaultProps} isVisible={false} />)
    
    expect(screen.queryByText('AI游戏助手')).not.toBeInTheDocument()
  })

  it('应该显示初始欢迎消息', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    expect(screen.getByText(/您好！我是您的桌游AI助手/)).toBeInTheDocument()
  })

  it('应该显示快速查询按钮', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    expect(screen.getByText('游戏规则是什么？')).toBeInTheDocument()
    expect(screen.getByText('我现在可以做什么？')).toBeInTheDocument()
    expect(screen.getByText('怎么计分？')).toBeInTheDocument()
  })

  it('应该能够输入查询文本', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('输入您的问题...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test query' } })
    
    await waitFor(() => {
      expect(input.value).toBe('test query')
    })
  })

  it('应该能够发送查询并显示AI响应', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('输入您的问题...')
    const sendButton = screen.getByText('发送')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('test query')).toBeInTheDocument()
      expect(screen.getByText('Test AI response')).toBeInTheDocument()
    })
  })

  it('应该显示AI响应的置信度', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('输入您的问题...')
    const sendButton = screen.getByText('发送')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('置信度: 90%')).toBeInTheDocument()
    })
  })

  it('应该显示建议动作列表', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('输入您的问题...')
    const sendButton = screen.getByText('发送')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('建议动作:')).toBeInTheDocument()
      expect(screen.getByText('action1')).toBeInTheDocument()
      expect(screen.getByText('action2')).toBeInTheDocument()
    })
  })

  it('应该显示相关规则列表', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const input = screen.getByPlaceholderText('输入您的问题...')
    const sendButton = screen.getByText('发送')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('相关规则:')).toBeInTheDocument()
      expect(screen.getByText('rule1')).toBeInTheDocument()
      expect(screen.getByText('rule2')).toBeInTheDocument()
    })
  })

  it('应该能够点击快速查询按钮', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const quickQueryButton = screen.getByText('游戏规则是什么？')
    fireEvent.click(quickQueryButton)
    
    const input = screen.getByPlaceholderText('输入您的问题...') as HTMLInputElement
    expect(input.value).toBe('游戏规则是什么？')
  })

  it('应该能够关闭AI助手面板', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const closeButton = screen.getByTestId('ai-close-button')
    fireEvent.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('应该在发送空查询时不执行操作', () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    const sendButton = screen.getByText('发送')
    fireEvent.click(sendButton)
    
    expect(sendButton).toBeDisabled()
  })

  it('应该显示游戏提示', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('实时提示')).toBeInTheDocument()
      expect(screen.getByText('Test Hint')).toBeInTheDocument()
      expect(screen.getByText('This is a test hint')).toBeInTheDocument()
    })
  })

  it('应该能够隐藏游戏提示', async () => {
    render(<AIAssistantPanel {...defaultProps} />)
    
    await waitFor(() => {
      const hideButton = screen.getByText('隐藏提示')
      fireEvent.click(hideButton)
      
      expect(screen.queryByText('实时提示')).not.toBeInTheDocument()
    })
  })
}) 