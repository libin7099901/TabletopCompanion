import { Player } from '../../types/common';

// 简单的事件发射器实现
interface EventHandler {
  (...args: any[]): void;
}

class SimpleEventEmitter {
  private events: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

export interface RTCConfiguration {
  iceServers: RTCIceServer[];
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: 'connecting' | 'connected' | 'disconnected' | 'failed';
  player: Player;
}

export interface GameMessage {
  type: 'game_state' | 'player_action' | 'chat_message' | 'template_sync';
  timestamp: number;
  senderId: string;
  data: any;
}

export class WebRTCManager extends SimpleEventEmitter {  private peers: Map<string, PeerConnection> = new Map();  private isHost: boolean = false;  private rtcConfig: RTCConfiguration;

  constructor() {
    super();
    // 默认使用Google STUN服务器，生产环境应该使用自己的STUN/TURN服务器
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  // 添加事件监听器方法，便于外部使用
  onPeerConnected(handler: (peer: PeerConnection) => void): void {
    this.on('peer-connected', handler);
  }

  onMessageReceived(handler: (data: { peerId: string; message: GameMessage }) => void): void {
    this.on('message-received', handler);
  }

  onPeerDisconnected(handler: (data: { peerId: string; player: Player }) => void): void {
    this.on('peer-disconnected', handler);
  }

  /**
   * 初始化WebRTC管理器
   */
    initialize(player: Player, isHost: boolean = false): void {    this.isHost = isHost;    this.emit('initialized', { player, isHost });  }

  /**
   * 创建到指定玩家的P2P连接
   */
  async createPeerConnection(peerId: string, targetPlayer: Player): Promise<PeerConnection> {
    try {
      const connection = new RTCPeerConnection(this.rtcConfig);
      
      // 创建数据通道（仅发起方创建）
      const dataChannel = this.isHost ? 
        connection.createDataChannel('gameData', { ordered: true }) : null;

      const peerConnection: PeerConnection = {
        id: peerId,
        connection,
        dataChannel,
        status: 'connecting',
        player: targetPlayer
      };

      // 设置ICE候选事件处理
      connection.onicecandidate = (event) => {
        if (event.candidate) {
          this.emit('ice-candidate', {
            peerId,
            candidate: event.candidate
          });
        }
      };

      // 设置连接状态变化处理
      connection.onconnectionstatechange = () => {
        const state = connection.connectionState;
        peerConnection.status = this.mapConnectionState(state);
        this.emit('connection-state-change', { peerId, state: peerConnection.status });
        
        if (state === 'connected') {
          this.emit('peer-connected', peerConnection);
        } else if (state === 'disconnected' || state === 'failed') {
          this.handlePeerDisconnection(peerId);
        }
      };

      // 数据通道事件处理
      if (dataChannel) {
        this.setupDataChannelEvents(dataChannel, peerId);
      }

      // 接收方的数据通道处理
      connection.ondatachannel = (event) => {
        const channel = event.channel;
        peerConnection.dataChannel = channel;
        this.setupDataChannelEvents(channel, peerId);
      };

      this.peers.set(peerId, peerConnection);
      return peerConnection;

    } catch (error) {
      console.error('创建P2P连接失败:', error);
      throw error;
    }
  }

  /**
   * 创建SDP offer
   */
  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    try {
      const offer = await peer.connection.createOffer();
      await peer.connection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('创建Offer失败:', error);
      throw error;
    }
  }

  /**
   * 创建SDP answer
   */
  async createAnswer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    try {
      await peer.connection.setRemoteDescription(offer);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('创建Answer失败:', error);
      throw error;
    }
  }

  /**
   * 设置远程SDP描述
   */
  async setRemoteAnswer(peerId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    try {
      await peer.connection.setRemoteDescription(answer);
    } catch (error) {
      console.error('设置远程Answer失败:', error);
      throw error;
    }
  }

  /**
   * 添加ICE候选
   */
  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    try {
      await peer.connection.addIceCandidate(candidate);
    } catch (error) {
      console.error('添加ICE候选失败:', error);
      throw error;
    }
  }

  /**
   * 向指定玩家发送游戏消息
   */
  sendMessageToPeer(peerId: string, message: GameMessage): boolean {
    const peer = this.peers.get(peerId);
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.warn(`无法向玩家 ${peerId} 发送消息: 连接未就绪`);
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      peer.dataChannel.send(messageStr);
      return true;
    } catch (error) {
      console.error(`向玩家 ${peerId} 发送消息失败:`, error);
      return false;
    }
  }

  /**
   * 广播消息给所有连接的玩家
   */
  broadcastMessage(message: GameMessage): void {
    const successCount = Array.from(this.peers.keys())
      .map(peerId => this.sendMessageToPeer(peerId, message))
      .filter(success => success).length;

    this.emit('message-broadcast', {
      message,
      successCount,
      totalPeers: this.peers.size
    });
  }

  /**
   * 获取所有连接的玩家
   */
  getConnectedPeers(): PeerConnection[] {
    return Array.from(this.peers.values())
      .filter(peer => peer.status === 'connected');
  }

  /**
   * 断开指定玩家的连接
   */
  disconnectPeer(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.connection.close();
      this.peers.delete(peerId);
      this.emit('peer-disconnected', { peerId, player: peer.player });
    }
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    this.peers.forEach((peer) => {
      peer.connection.close();
    });
    this.peers.clear();
    this.emit('all-disconnected');
  }

  /**
   * 设置数据通道事件处理
   */
  private setupDataChannelEvents(dataChannel: RTCDataChannel, peerId: string): void {
    dataChannel.onopen = () => {
      console.log(`数据通道已打开: ${peerId}`);
      this.emit('data-channel-open', { peerId });
    };

    dataChannel.onclose = () => {
      console.log(`数据通道已关闭: ${peerId}`);
      this.emit('data-channel-close', { peerId });
    };

    dataChannel.onmessage = (event) => {
      try {
        const message: GameMessage = JSON.parse(event.data);
        this.emit('message-received', { peerId, message });
      } catch (error) {
        console.error('解析接收到的消息失败:', error);
      }
    };

    dataChannel.onerror = (error) => {
      console.error(`数据通道错误 (${peerId}):`, error);
      this.emit('data-channel-error', { peerId, error });
    };
  }

  /**
   * 映射WebRTC连接状态到我们的状态
   */
  private mapConnectionState(state: RTCPeerConnectionState): PeerConnection['status'] {
    switch (state) {
      case 'connecting':
      case 'new':
        return 'connecting';
      case 'connected':
        return 'connected';
      case 'disconnected':
        return 'disconnected';
      case 'failed':
      case 'closed':
        return 'failed';
      default:
        return 'disconnected';
    }
  }

  /**
   * 处理玩家断开连接
   */
  private handlePeerDisconnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      this.emit('peer-disconnected', { peerId, player: peer.player });
      // 可以在这里实现重连逻辑
    }
  }
}

export default WebRTCManager; 