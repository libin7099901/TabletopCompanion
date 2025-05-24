// P2P通信服务 (WebRTC)
import { Player, Room } from '../types/common';

export interface P2PServiceConfig {
  iceServers: RTCIceServer[];
  debug?: boolean;
}

export interface P2PMessage {
  type: 'join' | 'leave' | 'game_state' | 'chat' | 'player_update' | 'room_update';
  data: any;
  senderId: string;
  timestamp: number;
}

export class P2PService {
  private static instance: P2PService;
  private config: P2PServiceConfig;
  private localPlayer: Player | null = null;
  private currentRoom: Room | null = null;
  private connections = new Map<string, RTCPeerConnection>();
  private dataChannels = new Map<string, RTCDataChannel>();
  private messageListeners = new Map<string, ((message: P2PMessage) => void)[]>();

  private constructor(config: P2PServiceConfig) {
    this.config = config;
  }

  public static getInstance(config?: P2PServiceConfig): P2PService {
    if (!P2PService.instance) {
      if (!config) {
        // 默认配置
        config = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ],
          debug: false
        };
      }
      P2PService.instance = new P2PService(config);
    }
    return P2PService.instance;
  }

  // 设置本地玩家
  public setLocalPlayer(player: Player): void {
    this.localPlayer = player;
    this.log('本地玩家设置完成:', player.name);
  }

  // 创建房间（作为主机）
  public async createRoom(roomName: string, maxPlayers: number = 4): Promise<Room> {
    if (!this.localPlayer) {
      throw new Error('必须先设置本地玩家');
    }

    const room: Room = {
      id: this.generateRoomId(),
      name: roomName,
      hostId: this.localPlayer.id,
      players: [{ ...this.localPlayer, isHost: true }],
      maxPlayers,
      isPrivate: false,
      createdAt: new Date()
    };

    this.currentRoom = room;
    this.log('房间创建成功:', room.id);
    return room;
  }

  // 加入房间
  public async joinRoom(roomId: string): Promise<Room> {
    if (!this.localPlayer) {
      throw new Error('必须先设置本地玩家');
    }

    try {
      // 这里应该实现信令服务器的连接逻辑
      // 目前是简化版实现，实际项目中需要一个信令服务器来交换连接信息
      
      const room: Room = {
        id: roomId,
        name: '未知房间', // 从主机获取
        hostId: 'unknown', // 从主机获取
        players: [{ ...this.localPlayer, isHost: false }],
        maxPlayers: 4,
        isPrivate: false,
        createdAt: new Date()
      };

      this.currentRoom = room;
      this.log('房间加入成功:', roomId);
      return room;
    } catch (error) {
      throw new Error(`加入房间失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 创建点对点连接
  public async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const connection = new RTCPeerConnection({
      iceServers: this.config.iceServers
    });

    this.connections.set(peerId, connection);

    // 设置事件监听器
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.log('ICE候选者生成:', event.candidate);
        // 这里应该通过信令服务器发送给对方
      }
    };

    connection.onconnectionstatechange = () => {
      this.log(`与 ${peerId} 的连接状态:`, connection.connectionState);
      if (connection.connectionState === 'disconnected' || 
          connection.connectionState === 'failed') {
        this.handlePeerDisconnection(peerId);
      }
    };

    // 创建数据通道
    const dataChannel = connection.createDataChannel('gameData', {
      ordered: true
    });

    this.setupDataChannel(dataChannel, peerId);
    this.dataChannels.set(peerId, dataChannel);

    // 监听来自对方的数据通道
    connection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, peerId);
    };

    return connection;
  }

  // 设置数据通道
  private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
    channel.onopen = () => {
      this.log(`与 ${peerId} 的数据通道已建立`);
    };

    channel.onmessage = (event) => {
      try {
        const message: P2PMessage = JSON.parse(event.data);
        this.handleReceivedMessage(message, peerId);
      } catch (error) {
        this.log('消息解析失败:', error);
      }
    };

    channel.onclose = () => {
      this.log(`与 ${peerId} 的数据通道已关闭`);
    };

    channel.onerror = (error) => {
      this.log(`与 ${peerId} 的数据通道错误:`, error);
    };
  }

  // 处理接收到的消息
  private handleReceivedMessage(message: P2PMessage, peerId: string): void {
    this.log('收到消息:', message.type, 'from', peerId);

    const listeners = this.messageListeners.get(message.type) || [];
    listeners.forEach(listener => listener(message));

    // 默认处理逻辑
    switch (message.type) {
      case 'join':
        this.handlePlayerJoin(message.data);
        break;
      case 'leave':
        this.handlePlayerLeave(peerId);
        break;
      case 'player_update':
        this.handlePlayerUpdate(message.data);
        break;
      // 其他消息类型的处理
    }
  }

  // 发送消息给指定玩家
  public sendMessage(peerId: string, type: P2PMessage['type'], data: any): void {
    const dataChannel = this.dataChannels.get(peerId);
    if (!dataChannel || dataChannel.readyState !== 'open') {
      this.log(`无法发送消息给 ${peerId}: 数据通道未就绪`);
      return;
    }

    const message: P2PMessage = {
      type,
      data,
      senderId: this.localPlayer?.id || 'unknown',
      timestamp: Date.now()
    };

    try {
      dataChannel.send(JSON.stringify(message));
      this.log('消息已发送:', type, 'to', peerId);
    } catch (error) {
      this.log('发送消息失败:', error);
    }
  }

  // 广播消息给所有连接的玩家
  public broadcastMessage(type: P2PMessage['type'], data: any): void {
    this.connections.forEach((_, peerId) => {
      this.sendMessage(peerId, type, data);
    });
  }

  // 添加消息监听器
  public addMessageListener(type: string, listener: (message: P2PMessage) => void): void {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, []);
    }
    this.messageListeners.get(type)!.push(listener);
  }

  // 移除消息监听器
  public removeMessageListener(type: string, listener: (message: P2PMessage) => void): void {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 处理玩家加入
  private handlePlayerJoin(playerData: Player): void {
    if (this.currentRoom) {
      const existingPlayerIndex = this.currentRoom.players.findIndex(p => p.id === playerData.id);
      if (existingPlayerIndex === -1) {
        this.currentRoom.players.push(playerData);
        this.log('玩家加入房间:', playerData.name);
      }
    }
  }

  // 处理玩家离开
  private handlePlayerLeave(playerId: string): void {
    if (this.currentRoom) {
      this.currentRoom.players = this.currentRoom.players.filter(p => p.id !== playerId);
      this.log('玩家离开房间:', playerId);
    }
    this.cleanupPeerConnection(playerId);
  }

  // 处理玩家信息更新
  private handlePlayerUpdate(playerData: Player): void {
    if (this.currentRoom) {
      const playerIndex = this.currentRoom.players.findIndex(p => p.id === playerData.id);
      if (playerIndex > -1) {
        this.currentRoom.players[playerIndex] = playerData;
      }
    }
  }

  // 处理对等连接断开
  private handlePeerDisconnection(peerId: string): void {
    this.log('对等连接断开:', peerId);
    this.cleanupPeerConnection(peerId);
    this.handlePlayerLeave(peerId);
  }

  // 清理对等连接
  private cleanupPeerConnection(peerId: string): void {
    const connection = this.connections.get(peerId);
    if (connection) {
      connection.close();
      this.connections.delete(peerId);
    }
    
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel) {
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }
  }

  // 离开当前房间
  public leaveRoom(): void {
    if (this.currentRoom && this.localPlayer) {
      this.broadcastMessage('leave', { playerId: this.localPlayer.id });
      
      // 清理所有连接
      this.connections.forEach((_, peerId) => {
        this.cleanupPeerConnection(peerId);
      });
      
      this.currentRoom = null;
      this.log('已离开房间');
    }
  }

  // 获取当前房间
  public getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  // 获取连接状态
  public getConnectionStatus(): Map<string, string> {
    const status = new Map<string, string>();
    this.connections.forEach((connection, peerId) => {
      status.set(peerId, connection.connectionState);
    });
    return status;
  }

  // 生成房间ID
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  // 日志输出
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[P2PService]', ...args);
    }
  }

  // 销毁服务
  public destroy(): void {
    this.leaveRoom();
    this.messageListeners.clear();
    this.localPlayer = null;
    this.log('P2P服务已销毁');
  }
} 