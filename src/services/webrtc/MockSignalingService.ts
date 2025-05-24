import { EventEmitter } from 'events';
import { Player } from '../../types/common';

export interface RoomInfo {
  id: string;
  name: string;
  maxPlayers: number;
  isPrivate: boolean;
  players: Player[];
  host: Player;
}

/**
 * Mock信令服务 - 用于演示和本地开发
 * 模拟WebSocket服务器的行为，支持单机多玩家测试
 */
export class MockSignalingService extends EventEmitter {
  private isConnected: boolean = false;
  private currentRoomId: string | null = null;
  
  // 模拟的房间存储（实际应用中这会在服务器端）
  private static rooms: Map<string, RoomInfo> = new Map();
  private static playerRooms: Map<string, string> = new Map(); // playerId -> roomId

  constructor() {
    super();
  }

  /**
   * 模拟连接到信令服务器
   */
  async connect(url: string): Promise<void> {
    console.log(`[Mock] 模拟连接到信令服务器: ${url}`);
    
    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.isConnected = true;
    this.emit('connected');
    
    console.log('[Mock] 信令服务器连接成功（模拟模式）');
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isConnected = false;
    this.currentRoomId = null;
    this.emit('disconnected');
    console.log('[Mock] 断开信令服务器连接');
  }

  /**
   * 创建房间
   */
  async createRoom(roomData: {
    name: string;
    maxPlayers: number;
    isPrivate: boolean;
  }, hostPlayerId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('未连接到信令服务器');
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建模拟房间信息
    const roomInfo: RoomInfo = {
      id: roomId,
      name: roomData.name,
      maxPlayers: roomData.maxPlayers,
      isPrivate: roomData.isPrivate,
      players: [],
      host: { id: hostPlayerId } as Player // 临时，会在room-created事件中被替换
    };

    MockSignalingService.rooms.set(roomId, roomInfo);
    MockSignalingService.playerRooms.set(hostPlayerId, roomId);

    // 模拟异步响应
    setTimeout(() => {
      this.emit('room-created', roomInfo);
      console.log(`[Mock] 房间创建成功: ${roomInfo.name} (${roomId})`);
    }, 100);
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId: string, playerId: string, _password?: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('未连接到信令服务器');
    }

    const room = MockSignalingService.rooms.get(roomId);
    if (!room) {
      setTimeout(() => {
        this.emit('signaling-error', { message: '房间不存在' });
      }, 100);
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      setTimeout(() => {
        this.emit('signaling-error', { message: '房间已满' });
      }, 100);
      return;
    }

    this.currentRoomId = roomId;
    MockSignalingService.playerRooms.set(playerId, roomId);

    // 模拟加入房间响应
    setTimeout(() => {
      this.emit('room-joined', room);
      console.log(`[Mock] 成功加入房间: ${room.name}`);
    }, 100);
  }

  /**
   * 离开房间
   */
  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const room = MockSignalingService.rooms.get(roomId);
    if (!room) return;

    // 从房间中移除玩家
    room.players = room.players.filter(p => p.id !== playerId);
    MockSignalingService.playerRooms.delete(playerId);

    // 如果房间为空，删除房间
    if (room.players.length === 0) {
      MockSignalingService.rooms.delete(roomId);
      console.log(`[Mock] 房间已删除: ${room.name}`);
    }

    this.currentRoomId = null;
    
    console.log(`[Mock] 离开房间: ${room.name}`);
  }

  /**
   * 发送信令消息
   */
  async sendSignalingMessage(targetPlayerId: string, message: any): Promise<void> {
    // 在真实环境中，这会通过WebSocket发送给目标玩家
    // 在Mock环境中，我们模拟点对点连接已建立
    console.log(`[Mock] 发送信令消息给 ${targetPlayerId}:`, message);
    
    // 模拟对方的响应
    setTimeout(() => {
      if (message.type === 'offer') {
        this.emit('signaling-message', {
          from: targetPlayerId,
          type: 'answer',
          data: { type: 'answer', sdp: 'mock-answer-sdp' }
        });
      } else if (message.type === 'ice-candidate') {
        // 模拟ICE候选交换完成
        this.emit('ice-candidate', {
          from: targetPlayerId,
          candidate: { candidate: 'mock-ice-candidate' }
        });
      }
    }, 200);
  }

  /**
   * 获取房间列表
   */
  async getRoomList(): Promise<RoomInfo[]> {
    return Array.from(MockSignalingService.rooms.values())
      .filter(room => !room.isPrivate);
  }

  /**
   * 检查是否已连接
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * 获取当前房间ID
   */
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  /**
   * 清理所有房间（用于测试）
   */
  static clearAllRooms(): void {
    this.rooms.clear();
    this.playerRooms.clear();
  }

  /**
   * 发送ICE候选
   */
  async sendIceCandidate(roomId: string, senderId: string, targetId: string, candidate: RTCIceCandidateInit): Promise<void> {
    console.log(`[Mock] 发送ICE候选从 ${senderId} 到 ${targetId} (房间: ${roomId}):`, candidate);
    
    // 模拟ICE候选交换
    setTimeout(() => {
      this.emit('ice-candidate', {
        from: targetId,
        candidate: candidate
      });
    }, 100);
  }

  /**
   * 发送offer
   */
  async sendOffer(roomId: string, senderId: string, targetId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[Mock] 发送offer从 ${senderId} 到 ${targetId} (房间: ${roomId}):`, offer);
    
    // 模拟offer/answer交换
    setTimeout(() => {
      this.emit('signaling-message', {
        from: targetId,
        type: 'answer',
        data: { type: 'answer', sdp: 'mock-answer-sdp' }
      });
    }, 200);
  }

  /**
   * 发送answer
   */
  async sendAnswer(roomId: string, senderId: string, targetId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[Mock] 发送answer从 ${senderId} 到 ${targetId} (房间: ${roomId}):`, answer);
    
    // 在Mock模式下，直接确认连接建立
    setTimeout(() => {
      this.emit('peer-connected', targetId);
    }, 100);
  }
} 