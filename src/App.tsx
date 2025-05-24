import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/layout/Header'
import HomePage from './components/pages/HomePage'
import TemplateManagePage from './components/pages/TemplateManagePage'
import GameStartPage from './components/pages/GameStartPage'
import GameRoomPage from './components/pages/GameRoomPage'
import { Player } from './types/common'
import { StorageService } from './services/StorageService'

type AppPage = 'home' | 'templates' | 'game-start' | 'game-room'

// 简化的房间状态（不使用Redux）
interface SimpleRoom {
  id: string
  name: string
  hostId: string
  players: Player[]
  maxPlayers: number
  isPrivate: boolean
  password?: string
  status: 'waiting' | 'playing'
  createdAt: string
  lastActivity: string
  settings: {
    allowSpectators: boolean
    autoStart: boolean
    timerEnabled: boolean
  }
  gameTemplate?: {
    id: string
    name: string
    description: string
    type: 'card' | 'board' | 'dice' | 'custom'
    minPlayers: number
    maxPlayers: number
    estimatedTime: number
    difficulty: 'easy' | 'medium' | 'hard'
    rules: string
    components: any[]
  }
}

const defaultTemplates = [
  {
    id: 'poker',
    name: '德州扑克',
    description: '经典的扑克游戏，考验心理战术和运气',
    type: 'card' as const,
    minPlayers: 2,
    maxPlayers: 8,
    estimatedTime: 30,
    difficulty: 'medium' as const,
    rules: '使用标准52张扑克牌，每个玩家获得2张底牌...',
    components: []
  },
  {
    id: 'chess',
    name: '国际象棋',
    description: '策略性棋类游戏，锻炼逻辑思维',
    type: 'board' as const,
    minPlayers: 2,
    maxPlayers: 2,
    estimatedTime: 45,
    difficulty: 'hard' as const,
    rules: '8x8棋盘，每个玩家16个棋子...',
    components: []
  },
  {
    id: 'dice_game',
    name: '骰子游戏',
    description: '简单有趣的骰子游戏，适合快速游戏',
    type: 'dice' as const,
    minPlayers: 2,
    maxPlayers: 6,
    estimatedTime: 15,
    difficulty: 'easy' as const,
    rules: '使用6个骰子，比较点数大小...',
    components: []
  }
]

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentRoom, setCurrentRoom] = useState<SimpleRoom | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPlayerData()
  }, [])

  const loadPlayerData = () => {
    const storageService = StorageService.getInstance()
    const savedPlayer = storageService.getPlayer() // 修正方法调用，不需要参数
    if (savedPlayer) {
      setCurrentPlayer(savedPlayer)
    }
  }

  const createPlayer = (name: string, id?: string): Player => {
    return {
      id: id || Date.now().toString(),
      name: name,
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }
  }

  const savePlayerData = (player: Player) => {
    const storageService = StorageService.getInstance()
    storageService.savePlayer(player)
    setCurrentPlayer(player)
  }

  // 页面导航
  const navigateTo = (page: AppPage) => {
    setCurrentPage(page)
  }

  // 游戏启动流程
  const handleStartGameFlow = () => {
    if (!currentPlayer) {
      // 创建一个默认玩家
      const defaultPlayer = createPlayer('玩家' + Math.floor(Math.random() * 1000))
      savePlayerData(defaultPlayer)
    }
    navigateTo('game-start')
  }

  // 房间操作
  const handleCreateRoom = async (config: any) => {
    setLoading(true)
    
    // 模拟创建房间
    setTimeout(() => {
      const now = new Date().toISOString()
      const hostPlayer = { ...currentPlayer!, isHost: true }
      
      const room: SimpleRoom = {
        id: 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        name: config.name,
        hostId: currentPlayer!.id,
        players: [hostPlayer],
        maxPlayers: config.maxPlayers,
        isPrivate: config.isPrivate,
        password: config.password,
        status: 'waiting',
        createdAt: now,
        lastActivity: now,
        settings: {
          allowSpectators: true,
          autoStart: false,
          timerEnabled: false
        }
      }
      
      setCurrentRoom(room)
      setCurrentPlayer(hostPlayer)
      setLoading(false)
      navigateTo('game-room')
    }, 1000)
  }

  const handleJoinRoom = async (roomId: string) => {
    setLoading(true)
    
    // 模拟加入房间（演示模式）
    setTimeout(() => {
      const now = new Date().toISOString()
      const guestPlayer = { ...currentPlayer!, isHost: false }
      
      const room: SimpleRoom = {
        id: roomId,
        name: '演示房间',
        hostId: 'other-player',
        players: [
          guestPlayer,
          createPlayer('其他玩家', 'other-player')
        ],
        maxPlayers: 4,
        isPrivate: false,
        status: 'waiting',
        createdAt: now,
        lastActivity: now,
        settings: {
          allowSpectators: true,
          autoStart: false,
          timerEnabled: false
        }
      }
      
      setCurrentRoom(room)
      setCurrentPlayer(guestPlayer)
      setLoading(false)
      navigateTo('game-room')
    }, 1000)
  }

  const handleDemoMode = () => {
    setLoading(true)
    
    // 创建演示房间
    setTimeout(() => {
      const now = new Date().toISOString()
      const hostPlayer = { ...currentPlayer!, isHost: true }
      
      const room: SimpleRoom = {
        id: 'DEMO' + Date.now(),
        name: '演示模式',
        hostId: currentPlayer!.id,
        players: [
          hostPlayer,
          createPlayer('AI助手', 'ai-player')
        ],
        maxPlayers: 2,
        isPrivate: false,
        status: 'waiting',
        createdAt: now,
        lastActivity: now,
        settings: {
          allowSpectators: true,
          autoStart: false,
          timerEnabled: false
        }
      }
      
      setCurrentRoom(room)
      setCurrentPlayer(hostPlayer)
      setLoading(false)
      navigateTo('game-room')
    }, 1000)
  }

  const handleSelectTemplate = (templateId: string) => {
    if (!currentRoom) return
    
    const template = defaultTemplates.find(t => t.id === templateId)
    if (template) {
      setCurrentRoom({
        ...currentRoom,
        gameTemplate: template,
        lastActivity: new Date().toISOString()
      })
    }
  }

  const handleStartGame = () => {
    if (!currentRoom) return
    
    setCurrentRoom({
      ...currentRoom,
      status: 'playing',
      lastActivity: new Date().toISOString()
    })
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    navigateTo('home')
  }

  const handleInvitePlayer = () => {
    if (!currentRoom) return
    
    navigator.clipboard.writeText(currentRoom.id).then(() => {
      alert(`房间ID已复制到剪贴板: ${currentRoom.id}\n请将此ID发送给您的朋友！`)
    }).catch(() => {
      alert(`房间ID: ${currentRoom.id}\n请将此ID发送给您的朋友！`)
    })
  }

  const handlePlayerSetup = () => {
    const name = prompt('请输入您的昵称:', currentPlayer?.name || '玩家')
    if (name) {
      const player = createPlayer(name, currentPlayer?.id)
      savePlayerData(player)
    }
  }

  // 渲染当前页面
  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentPlayer={currentPlayer}
            onManageTemplates={() => navigateTo('templates')}
            onPlayerSetup={handlePlayerSetup}
            onStartGame={handleStartGameFlow}
          />
        )

      case 'templates':
        return (
          <TemplateManagePage
            onBack={() => navigateTo('home')}
          />
        )

      case 'game-start':
        return currentPlayer ? (
          <GameStartPage
            currentPlayer={currentPlayer}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onDemoMode={handleDemoMode}
            onBack={() => navigateTo('home')}
          />
        ) : null

      case 'game-room':
        return currentRoom && currentPlayer ? (
          <GameRoomPage
            room={currentRoom}
            currentPlayer={currentPlayer}
            templates={defaultTemplates}
            onSelectTemplate={handleSelectTemplate}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onInvitePlayer={handleInvitePlayer}
          />
        ) : null

      default:
        return (
          <HomePage 
            currentPlayer={currentPlayer} 
            onManageTemplates={() => navigateTo('templates')} 
            onPlayerSetup={handlePlayerSetup} 
            onStartGame={handleStartGameFlow} 
          />
        )
    }
  }

  return (
    <div className="app">
      <Header 
        playerName={currentPlayer?.name}
        onPlayerClick={handlePlayerSetup}
        currentPage={currentPage}
        onNavigate={navigateTo}
      />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App 