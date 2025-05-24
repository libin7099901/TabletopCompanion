# 桌游伴侣信令服务器

这是一个简单的WebSocket信令服务器，用于协调桌游伴侣应用中的WebRTC P2P连接建立。

## 功能特性

- 房间创建和管理
- 玩家加入/离开房间
- WebRTC信令消息转发（offer、answer、ICE candidates）
- 自动清理空房间
- 支持私有房间（密码保护）

## 安装和运行

### 安装依赖
```bash
npm install
```

### 启动服务器
```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

服务器将在端口 8080 启动。

## 消息协议

### 客户端发送的消息

#### 创建房间
```json
{
  "type": "join-room",
  "senderId": "player-id",
  "data": {
    "action": "create",
    "roomData": {
      "name": "房间名称",
      "maxPlayers": 4,
      "isPrivate": false
    }
  }
}
```

#### 加入房间
```json
{
  "type": "join-room",
  "roomId": "room-id",
  "senderId": "player-id",
  "data": {
    "action": "join",
    "password": "密码（可选）"
  }
}
```

#### 离开房间
```json
{
  "type": "leave-room",
  "roomId": "room-id",
  "senderId": "player-id",
  "data": {}
}
```

#### WebRTC Offer
```json
{
  "type": "offer",
  "roomId": "room-id",
  "senderId": "sender-id",
  "targetId": "target-id",
  "data": {
    "type": "offer",
    "sdp": "..."
  }
}
```

#### WebRTC Answer
```json
{
  "type": "answer",
  "roomId": "room-id",
  "senderId": "sender-id",
  "targetId": "target-id",
  "data": {
    "type": "answer",
    "sdp": "..."
  }
}
```

#### ICE Candidate
```json
{
  "type": "ice-candidate",
  "roomId": "room-id",
  "senderId": "sender-id",
  "targetId": "target-id",
  "data": {
    "candidate": "...",
    "sdpMid": "...",
    "sdpMLineIndex": 0
  }
}
```

### 服务器发送的消息

#### 房间创建成功
```json
{
  "type": "room-created",
  "data": {
    "id": "room-id",
    "name": "房间名称",
    "hostId": "host-id",
    "maxPlayers": 4,
    "isPrivate": false
  }
}
```

#### 加入房间成功
```json
{
  "type": "room-joined",
  "data": {
    "id": "room-id",
    "name": "房间名称",
    "host": {
      "id": "host-id",
      "name": "host-name"
    },
    "players": [
      {"id": "player1", "name": "Player 1"},
      {"id": "player2", "name": "Player 2"}
    ],
    "maxPlayers": 4,
    "isPrivate": false
  }
}
```

#### 新玩家加入通知
```json
{
  "type": "peer-joined",
  "data": {
    "id": "player-id",
    "name": "Player Name"
  }
}
```

#### 玩家离开通知
```json
{
  "type": "peer-left",
  "data": "player-id"
}
```

#### 错误消息
```json
{
  "type": "error",
  "data": {
    "message": "错误描述"
  }
}
```

## 部署

### 本地部署
直接运行 `npm start` 即可。

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

### 云服务部署
可以部署到任何支持Node.js的云平台，如：
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

## 注意事项

1. 这是一个简单的信令服务器，仅用于开发和测试
2. 生产环境建议添加身份验证和频率限制
3. 房间数据存储在内存中，服务器重启后会丢失
4. 建议配置HTTPS和WSS以确保安全连接

## 许可证

MIT License 