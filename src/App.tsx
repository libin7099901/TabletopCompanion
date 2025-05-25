import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/layout/Header'
import HomePage from './components/pages/HomePage'
import TemplateManagePage from './components/pages/TemplateManagePage'
import PlayerSetupPage from './components/pages/PlayerSetupPage'
import AISettingsPage from './components/pages/AISettingsPage'
import GameStartPage from './components/pages/GameStartPage'
import GameRoomPage from './components/pages/GameRoomPage'
import { Player } from './types/common'
import { StorageService } from './services/StorageService'
import { DynamicGameLoader, ExtendedGameTemplate } from './services/DynamicGameLoader'

// === 类型定义 ===
type AppPage = 'home' | 'template' | 'player-setup' | 'ai-settings' | 'game-start' | 'game-room'

// === 类型转换工具 ===
const convertToGameTemplate = (template: ExtendedGameTemplate) => {
  // 组件类型映射：DynamicGameLoader类型 -> roomStore类型
  const mapComponentType = (type: string): 'deck' | 'board' | 'piece' | 'dice' | 'token' => {
    const typeMap: Record<string, 'deck' | 'board' | 'piece' | 'dice' | 'token'> = {
      'cards': 'deck',
      'board': 'board', 
      'tokens': 'token',
      'dice': 'dice',
      'timer': 'token', // 计时器映射为token
      'score': 'token', // 得分映射为token
      'custom': 'token' // 自定义映射为token
    };
    return typeMap[type] || 'token';
  };

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    type: 'custom' as const,
    minPlayers: template.minPlayers,
    maxPlayers: template.maxPlayers,
    estimatedTime: template.estimatedTime,
    difficulty: template.difficulty === 'beginner' ? 'easy' as const : 
               template.difficulty === 'medium' ? 'medium' as const : 'hard' as const,
    rules: template.rules.fullText,
    components: template.components.map(comp => ({
      id: comp.id,
      type: mapComponentType(comp.type),
      name: comp.name,
      properties: comp.properties
    }))
  };
};

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

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home')
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentRoom, setCurrentRoom] = useState<SimpleRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const [gameLoader] = useState(() => new DynamicGameLoader())

  useEffect(() => {
    loadPlayerData()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.forceLoadPlayerForTest = loadPlayerData; // 暴露给Cypress

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.forceLoadPlayerForTest; // 清理
    };
  }, [])

  const loadPlayerData = () => {
    console.log('[App.tsx] loadPlayerData called');
    const storageService = StorageService.getInstance();
    const savedPlayer = storageService.getPlayer(); // 这个方法会使用正确的键 'current_player'
    console.log('[App.tsx] Parsed player data from storageService.getPlayer():', savedPlayer);

    if (savedPlayer) {
      console.log('[App.tsx] Player found via StorageService, setting currentPlayer and data-player-loaded attribute.');
      setCurrentPlayer(savedPlayer);
      document.body.setAttribute('data-player-loaded', 'true'); 
      console.log('[App.tsx] data-player-loaded attribute SET to true.');
    } else {
      console.log('[App.tsx] No player found via StorageService, clearing currentPlayer and data-player-loaded attribute.');
      setCurrentPlayer(null); 
      document.body.removeAttribute('data-player-loaded');
      console.log('[App.tsx] data-player-loaded attribute REMOVED.');
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

  // 模板选择处理
  const handleSelectTemplate = (templateId: string) => {
    if (!currentRoom) return;
    console.log(`[App.tsx] handleSelectTemplate called with ID: ${templateId}`); // 调试日志
    const template = gameLoader.getTemplate(templateId);
    console.log('[App.tsx] gameLoader.getTemplate result:', template); // 调试日志
    if (template) {
      // 将ExtendedGameTemplate转换为SimpleRoom需要的格式
      const gameTemplate = convertToGameTemplate(template);
      console.log('[App.tsx] Converted gameTemplate for room:', gameTemplate); // 调试日志
      setCurrentRoom({
        ...currentRoom,
        gameTemplate
      });
    } else {
      console.error(`[App.tsx] Template not found with ID: ${templateId}`); // 调试日志
    }
  };

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
    navigateTo('player-setup')
  }

  const handlePlayerSetupComplete = (player: Player) => {
    savePlayerData(player)
    navigateTo('home')
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
            onManageTemplates={() => navigateTo('template')}
            onPlayerSetup={handlePlayerSetup}
            onAISettings={() => navigateTo('ai-settings')}
            onStartGame={handleStartGameFlow}
          />
        )

      case 'template':
        return (
          <TemplateManagePage
            onBack={() => navigateTo('home')}
            onSelectTemplate={(_templateId) => {
              navigateTo('game-start')
            }}
          />
        )

      case 'player-setup':
        return (
          <PlayerSetupPage
            onNext={handlePlayerSetupComplete}
            onBack={() => navigateTo('home')}
            existingPlayer={currentPlayer || undefined}
          />
        )

      case 'ai-settings':
        return (
          <AISettingsPage
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
        ) : (
          <HomePage 
            currentPlayer={currentPlayer} 
            onManageTemplates={() => navigateTo('template')} 
            onPlayerSetup={handlePlayerSetup} 
            onStartGame={handleStartGameFlow} 
            onAISettings={() => navigateTo('ai-settings')}
          />
        )

      case 'game-room':
        // 调试日志，查看传入GameRoomPage的模板数据
        console.log('[App.tsx] Templates for GameRoomPage:', gameLoader.getAllTemplates().map(convertToGameTemplate));
        return currentRoom && currentPlayer ? (
          <GameRoomPage
            room={currentRoom}
            currentPlayer={currentPlayer}
            templates={gameLoader.getAllTemplates().map(convertToGameTemplate)}
            onSelectTemplate={handleSelectTemplate}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
            onInvitePlayer={handleInvitePlayer}
            onBack={() => navigateTo('home')}
          />
        ) : null

      default:
        return (
          <HomePage 
            currentPlayer={currentPlayer} 
            onManageTemplates={() => navigateTo('template')} 
            onPlayerSetup={handlePlayerSetup} 
            onStartGame={handleStartGameFlow} 
            onAISettings={() => navigateTo('ai-settings')}
          />
        )
    }
  }

  return (
    <div className="app">
      <Header 
        playerName={currentPlayer?.name}
        onPlayerClick={handlePlayerSetup}
        currentPage={currentPage === 'template' ? 'templates' : currentPage}
        onNavigate={(page) => {
          if (page === 'templates') {
            navigateTo('template')
          } else {
            navigateTo(page)
          }
        }}
      />
      <main className="main-content page-with-navbar">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App 