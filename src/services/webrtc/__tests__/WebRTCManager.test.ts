import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { WebRTCManager } from '../WebRTCManager'
import { Player } from '../../../types/common'

describe('WebRTCManager', () => {
  let webRTCManager: WebRTCManager
  let mockPlayer: Player

  beforeEach(() => {
    webRTCManager = new WebRTCManager()
    mockPlayer = {
      id: 'test-player-1',
      name: 'Test Player',
      avatar: '👤',
      isHost: false,
      isConnected: true
    }
  })

  afterEach(() => {
    webRTCManager.disconnectAll()
    vi.clearAllMocks()
  })

  it('应该正确初始化WebRTCManager', () => {
    expect(webRTCManager).toBeDefined()
    expect(webRTCManager instanceof WebRTCManager).toBe(true)
  })

  it('应该能够初始化玩家', () => {
    const initSpy = vi.fn()
    webRTCManager.on('initialized', initSpy)
    
    webRTCManager.initialize(mockPlayer, true)
    
    expect(initSpy).toHaveBeenCalledWith({ player: mockPlayer, isHost: true })
  })

  it('应该能够创建P2P连接', async () => {
    const targetPlayer: Player = {
      id: 'test-player-2',
      name: 'Target Player',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    webRTCManager.initialize(mockPlayer, true)
    const connection = await webRTCManager.createPeerConnection('peer-2', targetPlayer)
    
    expect(connection).toBeDefined()
    expect(connection.id).toBe('peer-2')
    expect(connection.player).toEqual(targetPlayer)
    expect(connection.status).toBe('connecting')
  })

  it('应该能够创建SDP offer', async () => {
    const targetPlayer: Player = {
      id: 'test-player-2',
      name: 'Target Player',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    webRTCManager.initialize(mockPlayer, true)
    await webRTCManager.createPeerConnection('peer-2', targetPlayer)
    
    const offer = await webRTCManager.createOffer('peer-2')
    
    expect(offer).toBeDefined()
    expect(offer.type).toBe('offer')
    expect(offer.sdp).toBeDefined()
  })

  it('应该能够创建SDP answer', async () => {
    const targetPlayer: Player = {
      id: 'test-player-2',
      name: 'Target Player',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    const mockOffer: RTCSessionDescriptionInit = {
      type: 'offer',
      sdp: 'mock-sdp-offer'
    }

    webRTCManager.initialize(mockPlayer, false)
    await webRTCManager.createPeerConnection('peer-2', targetPlayer)
    
    const answer = await webRTCManager.createAnswer('peer-2', mockOffer)
    
    expect(answer).toBeDefined()
    expect(answer.type).toBe('answer')
    expect(answer.sdp).toBeDefined()
  })

  it('应该能够发送消息给特定peer', () => {
    const message = {
      type: 'game_state' as const,
      timestamp: Date.now(),
      senderId: mockPlayer.id,
      data: { action: 'test' }
    }

    webRTCManager.initialize(mockPlayer, true)
    
    // Should return false when peer doesn't exist or isn't connected
    const result = webRTCManager.sendMessageToPeer('peer-2', message)
    expect(result).toBe(false)
  })

  it('应该能够广播消息给所有peer', () => {
    const message = {
      type: 'player_action' as const,
      timestamp: Date.now(),
      senderId: mockPlayer.id,
      data: { action: 'play_card', cardId: 'card-1' }
    }

    webRTCManager.initialize(mockPlayer, true)
    
    // Should not throw error even with no connected peers
    expect(() => {
      webRTCManager.broadcastMessage(message)
    }).not.toThrow()
  })

  it('应该能够获取已连接的peer列表', () => {
    const peers = webRTCManager.getConnectedPeers()
    
    expect(Array.isArray(peers)).toBe(true)
    expect(peers).toHaveLength(0)
  })

  it('应该能够断开特定peer连接', async () => {
    const targetPlayer: Player = {
      id: 'test-player-2',
      name: 'Target Player',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    webRTCManager.initialize(mockPlayer, true)
    await webRTCManager.createPeerConnection('peer-2', targetPlayer)
    
    webRTCManager.disconnectPeer('peer-2')
    
    const peers = webRTCManager.getConnectedPeers()
    expect(peers.find(p => p.id === 'peer-2')).toBeUndefined()
  })

  it('应该能够断开所有连接', async () => {
    const targetPlayer1: Player = {
      id: 'test-player-2',
      name: 'Target Player 1',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    const targetPlayer2: Player = {
      id: 'test-player-3',
      name: 'Target Player 2',
      avatar: '🎯',
      isHost: false,
      isConnected: true
    }

    webRTCManager.initialize(mockPlayer, true)
    await webRTCManager.createPeerConnection('peer-2', targetPlayer1)
    await webRTCManager.createPeerConnection('peer-3', targetPlayer2)
    
    webRTCManager.disconnectAll()
    
    const peers = webRTCManager.getConnectedPeers()
    expect(peers).toHaveLength(0)
  })

  it('应该能够监听peer连接事件', () => {
    const connectedSpy = vi.fn()
    webRTCManager.onPeerConnected(connectedSpy)
    
    // Emit a test event
    webRTCManager.emit('peer-connected', { 
      id: 'peer-2', 
      player: mockPlayer,
      connection: {} as RTCPeerConnection,
      dataChannel: null,
      status: 'connected' as const
    })
    
    expect(connectedSpy).toHaveBeenCalled()
  })

  it('应该能够监听peer断开连接事件', () => {
    const disconnectedSpy = vi.fn()
    webRTCManager.onPeerDisconnected(disconnectedSpy)
    
    // Emit a test event
    webRTCManager.emit('peer-disconnected', { 
      peerId: 'peer-2', 
      player: mockPlayer 
    })
    
    expect(disconnectedSpy).toHaveBeenCalled()
  })

  it('应该能够监听消息接收事件', () => {
    const messageSpy = vi.fn()
    webRTCManager.onMessageReceived(messageSpy)
    
    const testMessage = {
      type: 'chat_message' as const,
      timestamp: Date.now(),
      senderId: 'peer-2',
      data: { text: 'Hello' }
    }
    
    // Emit a test event
    webRTCManager.emit('message-received', { 
      peerId: 'peer-2', 
      message: testMessage 
    })
    
    expect(messageSpy).toHaveBeenCalledWith({ 
      peerId: 'peer-2', 
      message: testMessage 
    })
  })

  it('应该正确处理ICE候选', async () => {
    const targetPlayer: Player = {
      id: 'test-player-2',
      name: 'Target Player',
      avatar: '🎮',
      isHost: false,
      isConnected: true
    }

    const mockCandidate: RTCIceCandidateInit = {
      candidate: 'candidate:mock',
      sdpMid: '0',
      sdpMLineIndex: 0
    }

    webRTCManager.initialize(mockPlayer, true)
    await webRTCManager.createPeerConnection('peer-2', targetPlayer)
    
    // Should not throw when adding ICE candidate
    await expect(
      webRTCManager.addIceCandidate('peer-2', mockCandidate)
    ).resolves.not.toThrow()
  })
}) 