const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// 存储房间和用户信息
const rooms = new Map();
const clients = new Map();

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 8080 });

console.log('桌游伴侣信令服务器启动在端口 8080');

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, { ws, rooms: new Set() });
  
  console.log(`客户端连接: ${clientId}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(clientId, message);
    } catch (error) {
      console.error('解析消息失败:', error);
      sendError(ws, 'Invalid message format');
    }
  });

  ws.on('close', () => {
    console.log(`客户端断开连接: ${clientId}`);
    handleClientDisconnect(clientId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket错误 (${clientId}):`, error);
  });
});

function handleMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  console.log(`收到消息 (${clientId}):`, message.type);

  switch (message.type) {
    case 'join-room':
      handleJoinRoom(clientId, message);
      break;
    case 'leave-room':
      handleLeaveRoom(clientId, message);
      break;
    case 'offer':
      handleOffer(clientId, message);
      break;
    case 'answer':
      handleAnswer(clientId, message);
      break;
    case 'ice-candidate':
      handleIceCandidate(clientId, message);
      break;
    default:
      console.warn(`未知消息类型: ${message.type}`);
      sendError(client.ws, `Unknown message type: ${message.type}`);
  }
}

function handleJoinRoom(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  const { data } = message;
  
  if (data.action === 'create') {
    // 创建新房间
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: data.roomData.name,
      hostId: clientId,
      players: new Map([[clientId, { id: clientId, name: message.senderId }]]),
      maxPlayers: data.roomData.maxPlayers,
      isPrivate: data.roomData.isPrivate,
      createdAt: Date.now()
    };
    
    rooms.set(roomId, room);
    client.rooms.add(roomId);
    
    // 通知房间创建成功
    sendMessage(client.ws, {
      type: 'room-created',
      data: {
        id: roomId,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        isPrivate: room.isPrivate
      }
    });
    
    console.log(`房间已创建: ${roomId} by ${clientId}`);
    
  } else if (data.action === 'join') {
    // 加入现有房间
    const roomId = message.roomId;
    const room = rooms.get(roomId);
    
    if (!room) {
      sendError(client.ws, 'Room not found');
      return;
    }
    
    if (room.players.size >= room.maxPlayers) {
      sendError(client.ws, 'Room is full');
      return;
    }
    
    // 添加玩家到房间
    room.players.set(clientId, { id: clientId, name: message.senderId });
    client.rooms.add(roomId);
    
    // 获取房间内所有玩家信息
    const players = Array.from(room.players.values());
    
    // 通知新玩家加入成功
    sendMessage(client.ws, {
      type: 'room-joined',
      data: {
        id: roomId,
        name: room.name,
        host: room.players.get(room.hostId),
        players: players,
        maxPlayers: room.maxPlayers,
        isPrivate: room.isPrivate
      }
    });
    
    // 通知房间内其他玩家有新玩家加入
    broadcastToRoom(roomId, {
      type: 'peer-joined',
      data: { id: clientId, name: message.senderId }
    }, clientId);
    
    console.log(`玩家 ${clientId} 加入房间 ${roomId}`);
  }
}

function handleLeaveRoom(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  const roomId = message.roomId;
  const room = rooms.get(roomId);
  
  if (room && room.players.has(clientId)) {
    room.players.delete(clientId);
    client.rooms.delete(roomId);
    
    // 通知房间内其他玩家
    broadcastToRoom(roomId, {
      type: 'peer-left',
      data: clientId
    }, clientId);
    
    // 如果房间空了或房主离开，删除房间
    if (room.players.size === 0 || room.hostId === clientId) {
      rooms.delete(roomId);
      console.log(`房间已删除: ${roomId}`);
    }
    
    console.log(`玩家 ${clientId} 离开房间 ${roomId}`);
  }
}

function handleOffer(clientId, message) {
  const targetClient = findClientInRoom(message.roomId, message.targetId);
  if (targetClient) {
    sendMessage(targetClient.ws, {
      type: 'offer',
      roomId: message.roomId,
      senderId: clientId,
      data: message.data
    });
  }
}

function handleAnswer(clientId, message) {
  const targetClient = findClientInRoom(message.roomId, message.targetId);
  if (targetClient) {
    sendMessage(targetClient.ws, {
      type: 'answer',
      roomId: message.roomId,
      senderId: clientId,
      data: message.data
    });
  }
}

function handleIceCandidate(clientId, message) {
  const targetClient = findClientInRoom(message.roomId, message.targetId);
  if (targetClient) {
    sendMessage(targetClient.ws, {
      type: 'ice-candidate',
      roomId: message.roomId,
      senderId: clientId,
      data: message.data
    });
  }
}

function handleClientDisconnect(clientId) {
  const client = clients.get(clientId);
  if (!client) return;

  // 从所有房间中移除该客户端
  for (const roomId of client.rooms) {
    const room = rooms.get(roomId);
    if (room) {
      room.players.delete(clientId);
      
      // 通知房间内其他玩家
      broadcastToRoom(roomId, {
        type: 'peer-left',
        data: clientId
      }, clientId);
      
      // 如果房间空了或房主离开，删除房间
      if (room.players.size === 0 || room.hostId === clientId) {
        rooms.delete(roomId);
      }
    }
  }
  
  clients.delete(clientId);
}

function findClientInRoom(roomId, targetId) {
  const room = rooms.get(roomId);
  if (!room || !room.players.has(targetId)) {
    return null;
  }
  
  return clients.get(targetId);
}

function broadcastToRoom(roomId, message, excludeClientId = null) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const playerId of room.players.keys()) {
    if (playerId !== excludeClientId) {
      const client = clients.get(playerId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        sendMessage(client.ws, message);
      }
    }
  }
}

function sendMessage(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws, errorMessage) {
  sendMessage(ws, {
    type: 'error',
    data: { message: errorMessage }
  });
}

// 定期清理空房间
setInterval(() => {
  for (const [roomId, room] of rooms.entries()) {
    if (room.players.size === 0) {
      rooms.delete(roomId);
      console.log(`清理空房间: ${roomId}`);
    }
  }
}, 60000); // 每分钟清理一次

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('正在关闭信令服务器...');
  wss.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('正在关闭信令服务器...');
  wss.close(() => {
    process.exit(0);
  });
}); 