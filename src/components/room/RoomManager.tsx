import React, { useState, useEffect, useCallback } from 'react';
import { Player } from '../../types/common';
import RoomManagerService, { RoomState } from '../../services/webrtc/RoomManager';
import { GameMessage } from '../../services/webrtc/WebRTCManager';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import RoomLobby from './RoomLobby';
import GameInterface from './GameInterface';

interface RoomManagerProps {
  localPlayer: Player;
}

const RoomManager: React.FC<RoomManagerProps> = ({ localPlayer }) => {
  const [roomManager] = useState(() => new RoomManagerService());
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<Player[]>([]);

  // 初始化房间管理器
  useEffect(() => {
    const initializeManager = async () => {
      try {
        await roomManager.initialize(localPlayer);
        setIsConnected(true);
        setConnectionError(null);
      } catch (error) {
        console.error('房间管理器初始化失败:', error);
        setConnectionError(error instanceof Error ? error.message : '连接失败');
        setIsConnected(false);
      }
    };

    initializeManager();
  }, [roomManager, localPlayer]);

  // 设置事件监听器
  useEffect(() => {
    const handleRoomCreated = (room: RoomState) => {
      setCurrentRoom(room);
      setShowCreateModal(false);
    };

    const handleRoomJoined = (room: RoomState) => {
      setCurrentRoom(room);
      setShowJoinModal(false);
    };

    const handlePlayerJoined = (player: Player) => {
      setConnectedPlayers(prev => [...prev, player]);
    };

    const handlePlayerLeft = (player: Player) => {
      setConnectedPlayers(prev => prev.filter(p => p.id !== player.id));
    };

    const handleRoomLeft = () => {
      setCurrentRoom(null);
      setIsGameStarted(false);
      setConnectedPlayers([]);
    };

    const handleGameMessage = (message: GameMessage, from: Player) => {
      console.log('收到游戏消息:', message, 'from:', from.name);
      
      // 处理特殊的游戏控制消息
      if (message.type === 'game_state' && message.data.action === 'start_game') {
        setIsGameStarted(true);
      }
    };

    const handleConnectionError = (error: any) => {
      setConnectionError(error.message || '连接错误');
    };

    roomManager.on('room-created', handleRoomCreated);
    roomManager.on('room-joined', handleRoomJoined);
    roomManager.on('player-joined', handlePlayerJoined);
    roomManager.on('player-left', handlePlayerLeft);
    roomManager.on('room-left', handleRoomLeft);
    roomManager.on('game-message', handleGameMessage);
    roomManager.on('connection-error', handleConnectionError);

    return () => {
      roomManager.off('room-created', handleRoomCreated);
      roomManager.off('room-joined', handleRoomJoined);
      roomManager.off('player-joined', handlePlayerJoined);
      roomManager.off('player-left', handlePlayerLeft);
      roomManager.off('room-left', handleRoomLeft);
      roomManager.off('game-message', handleGameMessage);
      roomManager.off('connection-error', handleConnectionError);
    };
  }, [roomManager]);

  // 创建房间
  const handleCreateRoom = useCallback(async (roomData: {
    name: string;
    maxPlayers: number;
    isPrivate: boolean;
    password?: string;
  }) => {
    try {
      await roomManager.createRoom(roomData);
    } catch (error) {
      console.error('创建房间失败:', error);
      setConnectionError(error instanceof Error ? error.message : '创建房间失败');
    }
  }, [roomManager]);

  // 加入房间
  const handleJoinRoom = useCallback(async (roomId: string, password?: string) => {
    try {
      await roomManager.joinRoom(roomId, password);
    } catch (error) {
      console.error('加入房间失败:', error);
      setConnectionError(error instanceof Error ? error.message : '加入房间失败');
    }
  }, [roomManager]);

  // 离开房间
  const handleLeaveRoom = useCallback(async () => {
    try {
      await roomManager.leaveRoom();
    } catch (error) {
      console.error('离开房间失败:', error);
    }
  }, [roomManager]);

  // 开始游戏
  const handleStartGame = useCallback((templateId: string) => {
    if (roomManager.isRoomHost()) {
      roomManager.broadcastGameMessage({
        type: 'game_state',
        data: {
          action: 'start_game',
          templateId
        }
      });
      setIsGameStarted(true);
    }
  }, [roomManager]);

  // 发送游戏消息
  const handleSendGameMessage = useCallback((message: Omit<GameMessage, 'timestamp' | 'senderId'>) => {
    roomManager.broadcastGameMessage(message);
  }, [roomManager]);

  // 组件销毁时清理
  useEffect(() => {
    return () => {
      roomManager.destroy();
    };
  }, [roomManager]);

  // 如果未连接，显示连接状态
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            正在连接游戏服务...
          </h3>
          <p className="text-gray-600 mb-4">
            正在尝试连接到多人游戏服务器
          </p>
          {connectionError && (
            <div className="text-left">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800">
                      连接信息
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      正在使用演示模式，某些多人游戏功能可能受限
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                重新连接
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 如果在游戏中，显示游戏界面
  if (isGameStarted && currentRoom) {
    return (
      <GameInterface
        room={currentRoom}
        localPlayer={localPlayer}
        connectedPlayers={connectedPlayers}
        onSendMessage={handleSendGameMessage}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // 如果在房间中，显示房间大厅
  if (currentRoom) {
    return (
      <RoomLobby
        room={currentRoom}
        localPlayer={localPlayer}
        connectedPlayers={connectedPlayers}
        isHost={roomManager.isRoomHost()}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // 默认显示房间选择界面
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">房间管理</h1>
        
        {connectionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {connectionError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>创建房间</div>
              <div className="text-sm opacity-80">作为主机创建新游戏房间</div>
            </div>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <div>加入房间</div>
              <div className="text-sm opacity-80">加入已存在的游戏房间</div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p>选择创建新房间或加入现有房间开始游戏</p>
        </div>
      </div>

      {/* 创建房间模态框 */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}

      {/* 加入房间模态框 */}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onJoinRoom={handleJoinRoom}
        />
      )}
    </div>
  );
};

export default RoomManager; 