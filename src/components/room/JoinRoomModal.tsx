import React, { useState } from 'react';

interface JoinRoomModalProps {
  onClose: () => void;
  onJoinRoom: (roomId: string, password?: string) => void;
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onClose, onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      alert('请输入房间ID');
      return;
    }

    setIsJoining(true);
    try {
      await onJoinRoom(roomId.trim(), password.trim() || undefined);
    } catch (error) {
      console.error('加入房间失败:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">加入房间</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isJoining}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              房间ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入房间ID"
              disabled={isJoining}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              从房间主机处获取房间ID
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              房间密码（可选）
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="如果是私有房间，请输入密码"
              disabled={isJoining}
              maxLength={20}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={isJoining}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isJoining}
            >
              {isJoining ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  加入中...
                </div>
              ) : (
                '加入房间'
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">提示：</p>
            <ul className="text-xs space-y-1">
              <li>• 请确保输入的房间ID正确</li>
              <li>• 私有房间需要密码才能加入</li>
              <li>• 房间可能有人数限制</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal; 