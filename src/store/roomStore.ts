// 🏗️ 房间状态管理系统 - Redux Store

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Player } from '../types/common';

// === 房间状态类型定义 ===
export interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  status: RoomStatus;
  gameTemplate?: GameTemplate;
  createdAt: string;
  lastActivity: string;
  settings: RoomSettings;
}

export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  type: 'card' | 'board' | 'dice' | 'custom';
  minPlayers: number;
  maxPlayers: number;
  estimatedTime: number; // 分钟
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail?: string;
  rules: string;
  components: GameComponent[];
}

export interface GameComponent {
  id: string;
  type: 'deck' | 'board' | 'piece' | 'dice' | 'token';
  name: string;
  properties: Record<string, any>;
}

export interface RoomSettings {
  allowSpectators: boolean;
  autoStart: boolean;
  timerEnabled: boolean;
  turnTimeLimit?: number; // 秒
}

export type RoomStatus = 
  | 'waiting'      // 等待玩家
  | 'starting'     // 准备开始
  | 'playing'      // 游戏中
  | 'paused'       // 暂停
  | 'finished'     // 已结束
  | 'closed';      // 已关闭

export interface RoomState {
  currentRoom: GameRoom | null;
  roomHistory: GameRoom[];
  templates: GameTemplate[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
}

// === 异步操作 ===

// 创建房间
export const createRoom = createAsyncThunk(
  'room/create',
  async (config: {
    name: string;
    maxPlayers: number;
    isPrivate: boolean;
    password?: string;
    host: Player;
  }) => {
    // 模拟API调用
    const roomId = generateRoomId();
    const room: GameRoom = {
      id: roomId,
      name: config.name,
      hostId: config.host.id,
      players: [config.host],
      maxPlayers: config.maxPlayers,
      isPrivate: config.isPrivate,
      password: config.password,
      status: 'waiting',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      settings: {
        allowSpectators: true,
        autoStart: false,
        timerEnabled: false
      }
    };

    // 保存到本地存储
    saveRoomToStorage(room);
    
    return room;
  }
);

// 加入房间
export const joinRoom = createAsyncThunk(
  'room/join',
  async (params: { roomId: string; player: Player; password?: string }) => {
    // 模拟API调用
    const room = loadRoomFromStorage(params.roomId);
    
    if (!room) {
      throw new Error('房间不存在或已关闭');
    }

    if (room.isPrivate && room.password !== params.password) {
      throw new Error('房间密码错误');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('房间已满');
    }

    // 检查玩家是否已在房间中
    if (room.players.some(p => p.id === params.player.id)) {
      // 重新连接
      return room;
    }

    // 添加玩家
    const updatedRoom = {
      ...room,
      players: [...room.players, params.player],
      lastActivity: new Date().toISOString()
    };

    saveRoomToStorage(updatedRoom);
    return updatedRoom;
  }
);

// 离开房间
export const leaveRoom = createAsyncThunk(
  'room/leave',
  async (params: { roomId: string; playerId: string }) => {
    const room = loadRoomFromStorage(params.roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    const updatedPlayers = room.players.filter(p => p.id !== params.playerId);
    
    // 如果房主离开且还有其他玩家，转移房主权限
    let newHostId = room.hostId;
    if (room.hostId === params.playerId && updatedPlayers.length > 0) {
      newHostId = updatedPlayers[0].id;
    }

    const updatedRoom = {
      ...room,
      hostId: newHostId,
      players: updatedPlayers,
      lastActivity: new Date().toISOString(),
      status: updatedPlayers.length === 0 ? 'closed' as RoomStatus : room.status
    };

    if (updatedRoom.status === 'closed') {
      removeRoomFromStorage(params.roomId);
    } else {
      saveRoomToStorage(updatedRoom);
    }

    return updatedRoom;
  }
);

// 选择游戏模板
export const selectGameTemplate = createAsyncThunk(
  'room/selectTemplate',
  async (params: { roomId: string; templateId: string; playerId: string }) => {
    const room = loadRoomFromStorage(params.roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.hostId !== params.playerId) {
      throw new Error('只有房主可以选择游戏模板');
    }

    const template = getTemplateById(params.templateId);
    if (!template) {
      throw new Error('游戏模板不存在');
    }

    const updatedRoom = {
      ...room,
      gameTemplate: template,
      lastActivity: new Date().toISOString()
    };

    saveRoomToStorage(updatedRoom);
    return updatedRoom;
  }
);

// 开始游戏
export const startGame = createAsyncThunk(
  'room/startGame',
  async (params: { roomId: string; playerId: string }) => {
    const room = loadRoomFromStorage(params.roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.hostId !== params.playerId) {
      throw new Error('只有房主可以开始游戏');
    }

    if (!room.gameTemplate) {
      throw new Error('请先选择游戏模板');
    }

    if (room.players.length < room.gameTemplate.minPlayers) {
      throw new Error(`至少需要${room.gameTemplate.minPlayers}名玩家才能开始游戏`);
    }

    const updatedRoom = {
      ...room,
      status: 'playing' as RoomStatus,
      lastActivity: new Date().toISOString()
    };

    saveRoomToStorage(updatedRoom);
    return updatedRoom;
  }
);

// === Redux Slice ===
const roomSlice = createSlice({
  name: 'room',
  initialState: {
    currentRoom: null,
    roomHistory: [],
    templates: getDefaultTemplates(),
    loading: false,
    error: null,
    connectionStatus: 'disconnected'
  } as RoomState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // 设置连接状态
    setConnectionStatus: (state, action: PayloadAction<RoomState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    
    // 更新房间信息（WebRTC同步）
    updateRoom: (state, action: PayloadAction<GameRoom>) => {
      state.currentRoom = action.payload;
      saveRoomToStorage(action.payload);
    },
    
    // 添加到历史记录
    addToHistory: (state, action: PayloadAction<GameRoom>) => {
      const existingIndex = state.roomHistory.findIndex(r => r.id === action.payload.id);
      if (existingIndex >= 0) {
        state.roomHistory[existingIndex] = action.payload;
      } else {
        state.roomHistory.unshift(action.payload);
      }
      // 限制历史记录数量
      state.roomHistory = state.roomHistory.slice(0, 10);
    },
    
    // 重置房间状态
    resetRoom: (state) => {
      state.currentRoom = null;
      state.error = null;
      state.connectionStatus = 'disconnected';
    }
  },
  extraReducers: (builder) => {
    // 创建房间
    builder
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
        state.connectionStatus = 'connected';
        roomSlice.caseReducers.addToHistory(state, action);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '创建房间失败';
      });

    // 加入房间
    builder
      .addCase(joinRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.connectionStatus = 'connecting';
      })
      .addCase(joinRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
        state.connectionStatus = 'connected';
        roomSlice.caseReducers.addToHistory(state, action);
      })
      .addCase(joinRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加入房间失败';
        state.connectionStatus = 'disconnected';
      });

    // 离开房间
    builder
      .addCase(leaveRoom.fulfilled, (state, action) => {
        if (action.payload.status === 'closed') {
          state.currentRoom = null;
          state.connectionStatus = 'disconnected';
        } else {
          state.currentRoom = action.payload;
        }
      });

    // 选择模板
    builder
      .addCase(selectGameTemplate.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      .addCase(selectGameTemplate.rejected, (state, action) => {
        state.error = action.error.message || '选择模板失败';
      });

    // 开始游戏
    builder
      .addCase(startGame.fulfilled, (state, action) => {
        state.currentRoom = action.payload;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.error = action.error.message || '开始游戏失败';
      });
  }
});

export const { clearError, setConnectionStatus, updateRoom, addToHistory, resetRoom } = roomSlice.actions;
export default roomSlice.reducer;

// === 工具函数 ===

function generateRoomId(): string {
  return 'ROOM' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function saveRoomToStorage(room: GameRoom): void {
  const key = `room_${room.id}`;
  localStorage.setItem(key, JSON.stringify(room));
  
  // 保存房间索引
  const roomIndex = JSON.parse(localStorage.getItem('room_index') || '[]');
  if (!roomIndex.includes(room.id)) {
    roomIndex.push(room.id);
    localStorage.setItem('room_index', JSON.stringify(roomIndex));
  }
}

function loadRoomFromStorage(roomId: string): GameRoom | null {
  const key = `room_${roomId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

function removeRoomFromStorage(roomId: string): void {
  const key = `room_${roomId}`;
  localStorage.removeItem(key);
  
  // 从索引中移除
  const roomIndex = JSON.parse(localStorage.getItem('room_index') || '[]');
  const updatedIndex = roomIndex.filter((id: string) => id !== roomId);
  localStorage.setItem('room_index', JSON.stringify(updatedIndex));
}

function getTemplateById(templateId: string): GameTemplate | null {
  const templates = getDefaultTemplates();
  return templates.find(t => t.id === templateId) || null;
}

function getDefaultTemplates(): GameTemplate[] {
  return [
    {
      id: 'poker',
      name: '德州扑克',
      description: '经典的扑克游戏，考验心理战术和运气',
      type: 'card',
      minPlayers: 2,
      maxPlayers: 8,
      estimatedTime: 30,
      difficulty: 'medium',
      rules: '使用标准52张扑克牌，每个玩家获得2张底牌...',
      components: [
        {
          id: 'deck',
          type: 'deck',
          name: '扑克牌组',
          properties: { cards: 52, suits: 4 }
        }
      ]
    },
    {
      id: 'chess',
      name: '国际象棋',
      description: '策略性棋类游戏，锻炼逻辑思维',
      type: 'board',
      minPlayers: 2,
      maxPlayers: 2,
      estimatedTime: 45,
      difficulty: 'hard',
      rules: '8x8棋盘，每个玩家16个棋子...',
      components: [
        {
          id: 'board',
          type: 'board',
          name: '棋盘',
          properties: { size: '8x8', squares: 64 }
        }
      ]
    },
    {
      id: 'dice_game',
      name: '骰子游戏',
      description: '简单有趣的骰子游戏，适合快速游戏',
      type: 'dice',
      minPlayers: 2,
      maxPlayers: 6,
      estimatedTime: 15,
      difficulty: 'easy',
      rules: '使用6个骰子，比较点数大小...',
      components: [
        {
          id: 'dice_set',
          type: 'dice',
          name: '骰子组',
          properties: { count: 6, sides: 6 }
        }
      ]
    }
  ];
} 