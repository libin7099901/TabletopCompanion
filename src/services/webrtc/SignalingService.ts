export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'room-created' | 'peer-joined' | 'peer-left' | 'error';
  roomId?: string;
  senderId: string;
  targetId?: string;
  data: any;
}

export interface RoomInfo {
  id: string;
  name: string;
  hostId: string;
  players: string[];
  maxPlayers: number;
  isPrivate: boolean;
}

export class SignalingService {
  private websocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnecting: boolean = false;
  private messageQueue: SignalingMessage[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  /**
   * 连接到信令服务器
   */
  async connect(url: string): Promise<void> {
    if (this.isConnecting || (this.websocket && this.websocket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(url);

        this.websocket.onopen = () => {
          console.log('信令服务器连接成功');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // 发送排队的消息
          this.flushMessageQueue();
          
          this.emit('connected');
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('解析信令消息失败:', error);
          }
        };

        this.websocket.onclose = (event) => {
          console.log('信令服务器连接关闭:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('disconnected', { code: event.code, reason: event.reason });
          
          // 如果不是正常关闭，尝试重连
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect(url);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('信令服务器连接错误:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close(1000, 'Client disconnecting');
      this.websocket = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // 阻止自动重连
  }

  /**
   * 发送信令消息
   */
  async sendMessage(message: SignalingMessage): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      console.warn('信令服务器未连接，消息已加入队列');
      this.messageQueue.push(message);
      return;
    }

    try {
      const messageStr = JSON.stringify(message);
      this.websocket.send(messageStr);
    } catch (error) {
      console.error('发送信令消息失败:', error);
      throw error;
    }
  }

  /**
   * 创建房间
   */
  async createRoom(roomData: { name: string; maxPlayers: number; isPrivate: boolean }, hostId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'join-room',
      senderId: hostId,
      data: {
        action: 'create',
        roomData
      }
    };

    await this.sendMessage(message);
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId: string, playerId: string, password?: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'join-room',
      roomId,
      senderId: playerId,
      data: {
        action: 'join',
        password
      }
    };

    await this.sendMessage(message);
  }

  /**
   * 离开房间
   */
  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'leave-room',
      roomId,
      senderId: playerId,
      data: {}
    };

    await this.sendMessage(message);
  }

  /**
   * 发送WebRTC Offer
   */
  async sendOffer(roomId: string, senderId: string, targetId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const message: SignalingMessage = {
      type: 'offer',
      roomId,
      senderId,
      targetId,
      data: offer
    };

    await this.sendMessage(message);
  }

  /**
   * 发送WebRTC Answer
   */
  async sendAnswer(roomId: string, senderId: string, targetId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const message: SignalingMessage = {
      type: 'answer',
      roomId,
      senderId,
      targetId,
      data: answer
    };

    await this.sendMessage(message);
  }

  /**
   * 发送ICE候选
   */
  async sendIceCandidate(roomId: string, senderId: string, targetId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const message: SignalingMessage = {
      type: 'ice-candidate',
      roomId,
      senderId,
      targetId,
      data: candidate
    };

    await this.sendMessage(message);
  }

  /**
   * 添加事件监听器
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * 移除事件监听器
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  /**
   * 处理接收到的信令消息
   */
  private handleMessage(message: SignalingMessage): void {
    console.log('收到信令消息:', message);

    switch (message.type) {
      case 'room-created':
        this.emit('room-created', message.data);
        break;
      case 'peer-joined':
        this.emit('peer-joined', message.data);
        break;
      case 'peer-left':
        this.emit('peer-left', message.data);
        break;
      case 'offer':
        this.emit('offer-received', {
          roomId: message.roomId,
          senderId: message.senderId,
          offer: message.data
        });
        break;
      case 'answer':
        this.emit('answer-received', {
          roomId: message.roomId,
          senderId: message.senderId,
          answer: message.data
        });
        break;
      case 'ice-candidate':
        this.emit('ice-candidate-received', {
          roomId: message.roomId,
          senderId: message.senderId,
          candidate: message.data
        });
        break;
      case 'error':
        this.emit('signaling-error', message.data);
        break;
      default:
        console.warn('未知的信令消息类型:', message.type);
    }
  }

  /**
   * 计划重连
   */
  private scheduleReconnect(url: string): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数退避

    console.log(`${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);

    setTimeout(() => {
      this.connect(url).catch(error => {
        console.error('重连失败:', error);
      });
    }, delay);
  }

  /**
   * 发送排队的消息
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message).catch(error => {
          console.error('发送排队消息失败:', error);
        });
      }
    }
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }

  /**
   * 获取连接状态字符串
   */
  get connectionState(): string {
    if (!this.websocket) return 'disconnected';
    
    switch (this.websocket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

export default SignalingService; 