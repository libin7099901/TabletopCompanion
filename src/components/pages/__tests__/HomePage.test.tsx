import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import HomePage from '../HomePage'
import { Player } from '../../../types/common'

// Mock StorageService
vi.mock('../../../services/StorageService', () => ({
  StorageService: {
    getInstance: () => ({
      getRoomHistory: () => []
    })
  }
}))

// Mock RoomManager component  
vi.mock('../../room/RoomManager', () => ({
  default: () => <div>正在连接信令服务器...</div>
}))

describe('HomePage', () => {
  const mockPlayer: Player = {
    id: 'test-player-id',
    name: 'Test Player', 
    isHost: false,
    isConnected: true
  }

  const mockProps = {
    currentPlayer: mockPlayer,
    onManageTemplates: vi.fn(),
    onPlayerSetup: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染欢迎信息', () => {
    render(<HomePage {...mockProps} />)
    
    expect(screen.getByText('欢迎回来，Test Player！')).toBeInTheDocument()
    expect(screen.getByText(/准备开始游戏了吗？/)).toBeInTheDocument()
  })

  it('应该在没有玩家时渲染设置提示', () => {
    const propsWithoutPlayer = { ...mockProps, currentPlayer: null }
    render(<HomePage {...propsWithoutPlayer} />)
    
    expect(screen.getByText('欢迎使用桌游伴侣')).toBeInTheDocument()
    expect(screen.getByText(/开始您的桌游之旅/)).toBeInTheDocument()
  })

  it('应该显示快速行动卡片', () => {
    render(<HomePage {...mockProps} />)
    
    expect(screen.getByText('开始游戏')).toBeInTheDocument()
    expect(screen.getByText('模板管理')).toBeInTheDocument()
    // 有玩家时不显示设置玩家卡片
    expect(screen.queryByText('设置玩家')).not.toBeInTheDocument()
  })

  it('应该在没有玩家时显示设置玩家卡片', () => {
    const propsWithoutPlayer = { ...mockProps, currentPlayer: null }
    render(<HomePage {...propsWithoutPlayer} />)
    
    expect(screen.getByText('开始游戏')).toBeInTheDocument()
    expect(screen.getByText('模板管理')).toBeInTheDocument()
    expect(screen.getByText('设置玩家')).toBeInTheDocument()
  })

  it('应该在点击模板管理时调用回调函数', () => {
    render(<HomePage {...mockProps} />)
    
    const templateButton = screen.getByText('模板管理')
    fireEvent.click(templateButton)
    
    expect(mockProps.onManageTemplates).toHaveBeenCalledTimes(1)
  })

  it('应该在点击设置玩家时调用回调函数（没有玩家时）', () => {
    const propsWithoutPlayer = { ...mockProps, currentPlayer: null }
    render(<HomePage {...propsWithoutPlayer} />)
    
    const setupButton = screen.getByText('设置玩家')
    fireEvent.click(setupButton)
    
    expect(propsWithoutPlayer.onPlayerSetup).toHaveBeenCalledTimes(1)
  })

  it('应该在没有玩家时点击开始游戏显示提示', () => {
    const propsWithoutPlayer = { ...mockProps, currentPlayer: null }
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<HomePage {...propsWithoutPlayer} />)
    
    const startButton = screen.getByText('立即开始')
    fireEvent.click(startButton)
    
    expect(alertSpy).toHaveBeenCalledWith('请先设置玩家信息')
    expect(propsWithoutPlayer.onPlayerSetup).toHaveBeenCalledTimes(1)
    
    alertSpy.mockRestore()
  })

  it('应该显示功能特性部分', () => {
    render(<HomePage {...mockProps} />)
    
    expect(screen.getByText('功能特性')).toBeInTheDocument()
    expect(screen.getByText('实时多人游戏')).toBeInTheDocument()
    expect(screen.getByText('游戏模板系统')).toBeInTheDocument()
    expect(screen.getByText('AI智能助手')).toBeInTheDocument()
    expect(screen.getByText('数据同步')).toBeInTheDocument()
  })

  it('应该在有玩家时点击开始游戏切换到房间管理器', async () => {
    render(<HomePage {...mockProps} />)
    
    const startButton = screen.getByText('立即开始')
    fireEvent.click(startButton)
    
    // 等待加载状态出现
    await waitFor(() => {
      expect(screen.getByText('正在连接信令服务器...')).toBeInTheDocument()
    })
  })
}) 