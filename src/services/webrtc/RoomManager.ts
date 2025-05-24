import { Player } from '../../types/common';
import WebRTCManager, { GameMessage, PeerConnection } from './WebRTCManager';
import SignalingService, { RoomInfo } from './SignalingService';
import { MockSignalingService } from './MockSignalingService';

export interface RoomState {
  id: string;
  name: string;
  host: Player;
  players: Map<string, Player>;
  maxPlayers: number;
  isPrivate: boolean;
  gameStarted: boolean;
  currentTemplate?: string;
}

export interface RoomManagerEvents {
  'room-created': (room: RoomState) => void;
  'room-joined': (room: RoomState) => void;
  'player-joined': (player: Player) => void;
  'player-left': (player: Player) => void;
  'room-left': () => void;
  'game-message': (message: GameMessage, from: Player) => void;
  'connection-error': (error: any) => void;
}

export class RoomManager {
  private webrtc: WebRTCManager;
  private signaling: SignalingService | MockSignalingService;
  private currentRoom: RoomState | null = null;
  private localPlayer: Player | null = null;
  private isHost: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();
  private signalingServerUrl: string;

  constructor(signalingServerUrl: string = 'ws://localhost:8080') {
    this.signalingServerUrl = signalingServerUrl;
    this.webrtc = new WebRTCManager();
    
    // 尝试使用真实信令服务，失败时降级到Mock服务
    this.signaling = new SignalingService();
    
    this.setupEventHandlers();
  }

  /**
   * 初始化房间管理器
   */
  async initialize(player: Player): Promise<void> {
    this.localPlayer = player;
    
    try {
      // 尝试连接真实信令服务器
      await this.signaling.connect(this.signalingServerUrl);
      console.log('房间管理器初始化成功 - 使用真实信令服务');
    } catch (error) {
      console.warn('真实信令服务器连接失败，切换到演示模式:', error);
      
      // 切换到Mock服务
      this.signaling = new MockSignalingService();
      this.setupEventHandlers(); // 重新设置事件处理器
      
      try {
        await this.signaling.connect(this.signalingServerUrl);
        console.log('房间管理器初始化成功 - 使用演示模式');
      } catch (mockError) {
        console.error('Mock信令服务初始化失败:', mockError);
        throw mockError;
      }
    }
  }

  /**
   * 创建新房间
   */
  async createRoom(roomData: { 
    name: string; 
    maxPlayers: number; 
    isPrivate: boolean;
    password?: string;
  }): Promise<RoomState> {
    if (!this.localPlayer) {
      throw new Error('请先初始化玩家信息');
    }

    try {
      this.isHost = true;
      this.webrtc.initialize(this.localPlayer, true);

      // 通过信令服务器创建房间
      await this.signaling.createRoom({
        name: roomData.name,
        maxPlayers: roomData.maxPlayers,
        isPrivate: roomData.isPrivate
      }, this.localPlayer.id);

      // 等待房间创建确认
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('创建房间超时'));
        }, 10000);

        this.signaling.on('room-created', (roomInfo: RoomInfo) => {
          clearTimeout(timeout);
          
          this.currentRoom = {
            id: roomInfo.id,
            name: roomInfo.name,
            host: this.localPlayer!,
            players: new Map([[this.localPlayer!.id, this.localPlayer!]]),
            maxPlayers: roomInfo.maxPlayers,
            isPrivate: roomInfo.isPrivate,
            gameStarted: false
          };

          this.emit('room-created', this.currentRoom);
          resolve(this.currentRoom);
        });

        this.signaling.on('signaling-error', (error: any) => {
          clearTimeout(timeout);
          reject(new Error(`创建房间失败: ${error.message || error}`));
        });
      });

    } catch (error) {
      console.error('创建房间失败:', error);
      throw error;
    }
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId: string, password?: string): Promise<RoomState> {
    if (!this.localPlayer) {
      throw new Error('请先初始化玩家信息');
    }

    try {
      this.isHost = false;
      this.webrtc.initialize(this.localPlayer, false);

      // 通过信令服务器加入房间
      await this.signaling.joinRoom(roomId, this.localPlayer.id, password);

      // 等待加入房间确认
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('加入房间超时'));
        }, 10000);

        this.signaling.on('room-joined', (roomInfo: any) => {
          clearTimeout(timeout);
          
          // 构建房间状态
          const players = new Map<string, Player>();
          roomInfo.players.forEach((player: Player) => {
            players.set(player.id, player);
          });

          this.currentRoom = {
            id: roomInfo.id,
            name: roomInfo.name,
            host: roomInfo.host,
            players,
            maxPlayers: roomInfo.maxPlayers,
            isPrivate: roomInfo.isPrivate,
            gameStarted: roomInfo.gameStarted || false
          };

          this.emit('room-joined', this.currentRoom);
          resolve(this.currentRoom);

          // 如果不是主机，向房间内其他玩家发起P2P连接
          this.connectToExistingPeers();
        });

        this.signaling.on('signaling-error', (error: any) => {
          clearTimeout(timeout);
          reject(new Error(`加入房间失败: ${error.message || error}`));
        });
      });

    } catch (error) {
      console.error('加入房间失败:', error);
      throw error;
    }
  }

  /**
   * 离开房间
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoom || !this.localPlayer) {
      return;
    }

    try {
      // 断开所有P2P连接
      this.webrtc.disconnectAll();

      // 通知信令服务器离开房间
      await this.signaling.leaveRoom(this.currentRoom.id, this.localPlayer.id);

      this.currentRoom = null;
      this.isHost = false;
      
      this.emit('room-left');
    } catch (error) {
      console.error('离开房间失败:', error);
      throw error;
    }
  }

  /**
   * 发送游戏消息给房间内所有玩家
   */
  broadcastGameMessage(message: Omit<GameMessage, 'timestamp' | 'senderId'>): void {
    if (!this.localPlayer) {
      throw new Error('本地玩家未初始化');
    }

    const fullMessage: GameMessage = {
      ...message,
      timestamp: Date.now(),
      senderId: this.localPlayer.id
    };

    this.webrtc.broadcastMessage(fullMessage);
  }

  /**
   * 发送游戏消息给指定玩家
   */
  sendGameMessageToPeer(peerId: string, message: Omit<GameMessage, 'timestamp' | 'senderId'>): boolean {
    if (!this.localPlayer) {
      throw new Error('本地玩家未初始化');
    }

    const fullMessage: GameMessage = {
      ...message,
      timestamp: Date.now(),
      senderId: this.localPlayer.id
    };

    return this.webrtc.sendMessageToPeer(peerId, fullMessage);
  }

  /**
   * 获取当前房间状态
   */
  getCurrentRoom(): RoomState | null {
    return this.currentRoom;
  }

  /**
   * 获取连接的玩家列表
   */
  getConnectedPlayers(): Player[] {
    const connectedPeers = this.webrtc.getConnectedPeers();
    return connectedPeers.map(peer => peer.player);
  }

  /**
   * 检查是否为房间主机
   */
  isRoomHost(): boolean {
    return this.isHost;
  }

  /**
   * 添加事件监听器
   */
  on<K extends keyof RoomManagerEvents>(event: K, handler: RoomManagerEvents[K]): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler as Function);
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof RoomManagerEvents>(event: K, handler: RoomManagerEvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler as Function);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof RoomManagerEvents>(event: K, ...args: Parameters<RoomManagerEvents[K]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // WebRTC事件处理
    this.webrtc.onPeerConnected((peer: PeerConnection) => {
      console.log('玩家已连接:', peer.player.name);
      if (this.currentRoom) {
        this.currentRoom.players.set(peer.id, peer.player);
        this.emit('player-joined', peer.player);
      }
    });

    this.webrtc.onMessageReceived(({ peerId, message }) => {
      const peer = this.webrtc.getConnectedPeers().find(p => p.id === peerId);
      if (peer) {
        this.emit('game-message', message, peer.player);
      }
    });

    this.webrtc.onPeerDisconnected(({ peerId, player }) => {
      console.log('玩家已断开连接:', player.name);
      if (this.currentRoom) {
        this.currentRoom.players.delete(peerId);
        this.emit('player-left', player);
      }
    });

    // 信令服务器事件处理
    this.signaling.on('peer-joined', async (playerInfo: Player) => {
      if (this.isHost && this.currentRoom) {
        // 主机向新加入的玩家发起P2P连接
        await this.initiateConnectionToPeer(playerInfo);
      }
    });

    this.signaling.on('peer-left', (playerId: string) => {
      if (this.currentRoom && this.currentRoom.players.has(playerId)) {
        const player = this.currentRoom.players.get(playerId)!;
        this.currentRoom.players.delete(playerId);
        this.webrtc.disconnectPeer(playerId);
        this.emit('player-left', player);
      }
    });

    // WebRTC信令消息处理
    this.signaling.on('offer-received', async ({ roomId, senderId, offer }: { roomId: string; senderId: string; offer: RTCSessionDescriptionInit }) => {
      if (roomId === this.currentRoom?.id) {
        await this.handleOfferReceived(senderId, offer);
      }
    });

    this.signaling.on('answer-received', async ({ roomId, senderId, answer }: { roomId: string; senderId: string; answer: RTCSessionDescriptionInit }) => {
      if (roomId === this.currentRoom?.id) {
        await this.handleAnswerReceived(senderId, answer);
      }
    });

    this.signaling.on('ice-candidate-received', async ({ roomId, senderId, candidate }: { roomId: string; senderId: string; candidate: RTCIceCandidateInit }) => {
      if (roomId === this.currentRoom?.id) {
        await this.handleIceCandidateReceived(senderId, candidate);
      }
    });

    // WebRTC ICE候选事件
    this.webrtc.on('ice-candidate', async ({ peerId, candidate }) => {
      if (this.currentRoom) {
        await this.signaling.sendIceCandidate(
          this.currentRoom.id,
          this.localPlayer!.id,
          peerId,
          candidate
        );
      }
    });

    // 错误处理
    this.signaling.on('error', (error: any) => {
      this.emit('connection-error', error);
    });
  }

  /**
   * 连接到房间内已存在的玩家
   */
  private async connectToExistingPeers(): Promise<void> {
    if (!this.currentRoom || !this.localPlayer) return;

    for (const [peerId, player] of this.currentRoom.players) {
      if (peerId !== this.localPlayer.id) {
        await this.initiateConnectionToPeer(player);
      }
    }
  }

  /**
   * 向指定玩家发起P2P连接
   */
  private async initiateConnectionToPeer(targetPlayer: Player): Promise<void> {
    try {
      await this.webrtc.createPeerConnection(targetPlayer.id, targetPlayer);
      const offer = await this.webrtc.createOffer(targetPlayer.id);
      
      await this.signaling.sendOffer(
        this.currentRoom!.id,
        this.localPlayer!.id,
        targetPlayer.id,
        offer
      );
    } catch (error) {
      console.error(`向玩家 ${targetPlayer.name} 发起连接失败:`, error);
    }
  }

  /**
   * 处理收到的WebRTC Offer
   */
  private async handleOfferReceived(senderId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    try {
      // 查找发送者信息
      const senderPlayer = this.currentRoom?.players.get(senderId);
      if (!senderPlayer) {
        console.error('未找到发送者信息:', senderId);
        return;
      }

      await this.webrtc.createPeerConnection(senderId, senderPlayer);
      const answer = await this.webrtc.createAnswer(senderId, offer);
      
      await this.signaling.sendAnswer(
        this.currentRoom!.id,
        this.localPlayer!.id,
        senderId,
        answer
      );
    } catch (error) {
      console.error('处理Offer失败:', error);
    }
  }

  /**
   * 处理收到的WebRTC Answer
   */
  private async handleAnswerReceived(senderId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.webrtc.setRemoteAnswer(senderId, answer);
    } catch (error) {
      console.error('处理Answer失败:', error);
    }
  }

  /**
   * 处理收到的ICE候选
   */
  private async handleIceCandidateReceived(senderId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.webrtc.addIceCandidate(senderId, candidate);
    } catch (error) {
      console.error('处理ICE候选失败:', error);
    }
  }

  /**
   * 销毁房间管理器
   */
  destroy(): void {
    this.webrtc.disconnectAll();
    this.signaling.disconnect();
    this.currentRoom = null;
    this.localPlayer = null;
    this.isHost = false;
    this.eventHandlers.clear();
  }
}

export default RoomManager; 