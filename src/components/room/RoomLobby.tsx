import React, { useState } from 'react';
import { Player } from '../../types/common';
import { RoomState } from '../../services/webrtc/RoomManager';

interface RoomLobbyProps {
  room: RoomState;
  localPlayer: Player;
  connectedPlayers: Player[];
  isHost: boolean;
  onStartGame: (templateId: string) => void;
  onLeaveRoom: () => void;
}

const RoomLobby: React.FC<RoomLobbyProps> = ({
  room,
  localPlayer,
  connectedPlayers,
  isHost,
  onStartGame,
  onLeaveRoom
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('simple-card-compare');
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  // 可用的游戏模板
  const availableTemplates = [
    {
      id: 'simple-card-compare',
      name: '简单比大小',
      description: '一个简单的纸牌比大小游戏，玩家同时出牌，大的获胜',
      minPlayers: 2,
      maxPlayers: 4,
      duration: 15
    }
  ];

  const allPlayers = Array.from(room.players.values());
  const canStartGame = isHost && allPlayers.length >= 2;

  const handleStartGame = () => {
    if (canStartGame) {
      onStartGame(selectedTemplate);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id).then(() => {
      alert('房间ID已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制房间ID');
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 房间标题和操作栏 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{room.name}</h1>
              <p className="text-gray-600">房间ID: {room.id}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={copyRoomId}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                复制房间ID
              </button>
              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                房间信息
              </button>
              <button
                onClick={onLeaveRoom}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                离开房间
              </button>
            </div>
          </div>

          {/* 房间信息展开面板 */}
          {showRoomInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">房间类型:</span> {room.isPrivate ? '私有' : '公开'}</p>
                  <p><span className="font-medium">最大玩家:</span> {room.maxPlayers}人</p>
                </div>
                <div>
                  <p><span className="font-medium">当前玩家:</span> {allPlayers.length}人</p>
                  <p><span className="font-medium">房主:</span> {room.host.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 玩家列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">玩家列表 ({allPlayers.length}/{room.maxPlayers})</h2>
              <div className="space-y-3">
                {allPlayers.map((player) => {
                  const isConnected = connectedPlayers.some(p => p.id === player.id) || player.id === localPlayer.id;
                  const isRoomHost = player.id === room.host.id;
                  const isLocalPlayer = player.id === localPlayer.id;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        isLocalPlayer ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: player.avatar || undefined }}
                          >
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              isConnected ? 'bg-green-500' : 'bg-gray-500'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{player.name}</span>
                            {isRoomHost && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                房主
                              </span>
                            )}
                            {isLocalPlayer && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                您
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isConnected ? '已连接' : '连接中...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 空位占位符 */}
                {Array.from({ length: room.maxPlayers - allPlayers.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center p-3 rounded-md border border-dashed border-gray-300 bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 text-gray-400">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span>等待玩家加入...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 游戏设置 */}
          <div className="space-y-6">
            {/* 游戏选择 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">选择游戏</h3>
              <div className="space-y-3">
                {availableTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={selectedTemplate === template.id}
                        onChange={() => setSelectedTemplate(template.id)}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.minPlayers}-{template.maxPlayers}人 • {template.duration}分钟
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 开始游戏按钮 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">游戏控制</h3>
              {isHost ? (
                <div>
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame}
                    className={`w-full py-3 px-4 rounded-md font-bold transition-colors ${
                      canStartGame
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canStartGame ? '开始游戏' : '等待更多玩家'}
                  </button>
                  {!canStartGame && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      至少需要2名玩家才能开始游戏
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-600 mb-2">等待房主开始游戏...</div>
                  <div className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-md">
                    等待中
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby; 