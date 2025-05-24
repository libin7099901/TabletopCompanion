import React, { useState, useEffect } from 'react';
import { Player } from '../../types/common';
import { RoomState } from '../../services/webrtc/RoomManager';
import { GameMessage } from '../../services/webrtc/WebRTCManager';
import { GameTemplate, GameState as TemplateGameState } from '../../services/gameTemplate/GameTemplateEngine';
import AIAssistantPanel from '../ai/AIAssistantPanel';


interface GameInterfaceProps {
  room: RoomState;
  localPlayer: Player;
  connectedPlayers: Player[];
  onSendMessage: (message: Omit<GameMessage, 'timestamp' | 'senderId'>) => void;
  onLeaveRoom: () => void;
}

interface GameState {
  currentPhase: string;
  currentPlayer: string;
  turn: number;
  scores: Record<string, number>;
  gameData: any;
  isMyTurn: boolean;
}

const GameInterface: React.FC<GameInterfaceProps> = ({
  room,
  localPlayer,
  connectedPlayers,
  onSendMessage,
  onLeaveRoom
}) => {
  // 创建简单比大小游戏模板
  const [gameTemplate] = useState<GameTemplate>({
    id: 'simple-card-comparison',
    name: '简单比大小',
    version: '1.0.0',
    description: '每位玩家出一张牌，比较牌的威力值，威力值最高的玩家获胜',
    type: 'card',
    minPlayers: 2,
    maxPlayers: 6,
    estimatedDuration: 15,
    rules: {
      setup: {
        initialState: {},
        playerSetup: [
          { property: 'hand', value: [] },
          { property: 'score', value: 0 }
        ],
        cardSetup: {
          deck: [
            { id: 'hearts_ace', name: '红桃A', type: 'playing_card', power: 14, count: 1 },
            { id: 'spades_king', name: '黑桃K', type: 'playing_card', power: 13, count: 1 },
            { id: 'diamonds_queen', name: '方片Q', type: 'playing_card', power: 12, count: 1 },
            { id: 'clubs_jack', name: '梅花J', type: 'playing_card', power: 11, count: 1 },
            { id: 'hearts_ten', name: '红桃10', type: 'playing_card', power: 10, count: 1 }
          ],
          handSize: 5,
          dealingOrder: 'clockwise'
        }
      },
      gameplay: {
        turnStructure: {
          order: 'simultaneous',
          timeLimit: 30
        },
        phases: [
          {
            id: 'play_card',
            name: '出牌阶段',
            description: '所有玩家同时选择一张牌出牌',
            actions: ['选择手牌', '确认出牌']
          },
          {
            id: 'compare',
            name: '比较阶段',
            description: '比较所有玩家出的牌，威力值最高者获胜',
            actions: ['比较牌面', '确定获胜者', '记录分数']
          }
        ],
        validMoves: [],
        specialRules: []
      },
      scoring: {
        scoreType: 'points',
        scoreCalculation: [
          { source: 'round_wins', formula: 'count', weight: 1 }
        ],
        bonuses: []
      },
      endConditions: [
        {
          type: 'score',
          condition: [
            { type: 'resource', property: 'hand', operator: '==', value: 0 }
          ],
          result: 'win'
        }
      ],
      actions: [
        {
          id: 'play_card',
          name: '出牌',
          description: '从手牌中选择一张牌出牌',
          type: 'play_card',
          requirements: [
            { type: 'state', property: 'currentPhase', operator: '==', value: 'play_card' }
          ],
          effects: []
        }
      ]
    },
    assets: {
      images: []
    },
    metadata: {
      author: '桌游助手',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: ['卡牌', '比较', '简单'],
      difficulty: 'easy',
      category: ['卡牌游戏'],
      language: 'zh-CN'
    }
  });

  const [gameState, setGameState] = useState<GameState>({
    currentPhase: 'play_card',
    currentPlayer: localPlayer.id,
    turn: 1,
    scores: {},
    gameData: {},
    isMyTurn: true
  });
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [playedCards, setPlayedCards] = useState<Record<string, any>>({});
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [showScores, setShowScores] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // 模拟手牌（简单比大小游戏）
  const [hand, setHand] = useState<any[]>([
    { id: 'card1', name: '红桃A', power: 14, suit: 'heart' },
    { id: 'card2', name: '黑桃K', power: 13, suit: 'spade' },
    { id: 'card3', name: '方片Q', power: 12, suit: 'diamond' },
    { id: 'card4', name: '梅花J', power: 11, suit: 'club' },
    { id: 'card5', name: '红桃10', power: 10, suit: 'heart' }
  ]);

  // 将本地游戏状态转换为模板引擎的游戏状态格式
  const templateGameState: TemplateGameState = {
    templateId: gameTemplate.id,
    gameId: room.id,
    players: Array.from(room.players.values()).map(player => ({
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      isConnected: connectedPlayers.some(p => p.id === player.id) || player.id === localPlayer.id,
      resources: { score: gameState.scores[player.id] || 0 },
      state: 'active'
    })),
    currentPlayer: gameState.currentPlayer,
    currentPhase: gameState.currentPhase,
    turn: gameState.turn,
    hands: { [localPlayer.id]: hand },
    scores: gameState.scores,
    gameData: gameState.gameData,
    history: [],
    startTime: Date.now(),
    isFinished: false
  };

  useEffect(() => {
    // 初始化分数
    const initialScores: Record<string, number> = {};
    Array.from(room.players.values()).forEach(player => {
      initialScores[player.id] = 0;
    });
    setGameState(prev => ({ ...prev, scores: initialScores }));
    
    // 添加游戏开始日志
    setGameLog(['游戏开始！']);
  }, [room.players]);

  const handleCardPlay = (card: any) => {
    if (!gameState.isMyTurn) return;

    setSelectedCard(card);
    setPlayedCards(prev => ({ ...prev, [localPlayer.id]: card }));
    
    // 发送出牌消息
    onSendMessage({
      type: 'player_action',
      data: {
        action: 'play_card',
        card: card,
        playerId: localPlayer.id
      }
    });

    // 从手牌中移除这张牌
    setHand(prev => prev.filter(c => c.id !== card.id));
    setGameState(prev => ({ ...prev, isMyTurn: false }));
    
    addToGameLog(`${localPlayer.name} 出了 ${card.name}`);
  };

  const addToGameLog = (message: string) => {
    setGameLog(prev => [...prev, `第${gameState.turn}轮: ${message}`]);
  };

  const handleNextRound = () => {
    // 比较所有出的牌，找出获胜者
    const cards = Object.entries(playedCards);
    if (cards.length === 0) return;

    let winner = cards[0];
    for (const [playerId, card] of cards) {
      if (card.power > winner[1].power) {
        winner = [playerId, card];
      }
    }

    const winnerPlayer = Array.from(room.players.values()).find(p => p.id === winner[0]);
    if (winnerPlayer) {
      addToGameLog(`${winnerPlayer.name} 获胜！`);
      
      // 更新分数
      setGameState(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [winner[0]]: prev.scores[winner[0]] + 1
        },
        turn: prev.turn + 1,
        isMyTurn: true
      }));
    }

    // 清空出的牌
    setPlayedCards({});
    setSelectedCard(null);
  };

  const handleEndGame = () => {
    if (window.confirm('确定要结束游戏吗？')) {
      onSendMessage({
        type: 'game_state',
        data: {
          action: 'end_game'
        }
      });
      onLeaveRoom();
    }
  };

  const allPlayers = Array.from(room.players.values());
  const maxScore = Math.max(...Object.values(gameState.scores));
  const leaders = Object.entries(gameState.scores)
    .filter(([_, score]) => score === maxScore)
    .map(([playerId, _]) => allPlayers.find(p => p.id === playerId)?.name)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* 游戏头部 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">简单比大小游戏</h1>
              <p className="text-gray-600">房间: {room.name} • 第 {gameState.turn} 轮</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAIAssistant(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>AI助手</span>
              </button>
              <button
                onClick={() => setShowScores(!showScores)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {showScores ? '隐藏分数' : '显示分数'}
              </button>
              <button
                onClick={handleEndGame}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                结束游戏
              </button>
            </div>
          </div>

          {/* 分数显示 */}
          {showScores && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-bold mb-2">当前分数</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allPlayers.map(player => (
                  <div key={player.id} className="text-center">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-lg font-bold text-blue-600">
                      {gameState.scores[player.id] || 0}
                    </div>
                  </div>
                ))}
              </div>
              {leaders.length > 0 && (
                <div className="mt-2 text-center text-sm text-green-600">
                  当前领先: {leaders.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* 游戏区域 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 游戏桌面 */}
            <div className="bg-green-600 rounded-lg shadow-lg p-6 min-h-96">
              <h2 className="text-white text-xl font-bold mb-4 text-center">游戏桌面</h2>
              
              {/* 已出的牌 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {allPlayers.map(player => {
                  const playedCard = playedCards[player.id];
                  return (
                    <div key={player.id} className="text-center">
                      <div className="text-white text-sm mb-2">{player.name}</div>
                      <div className="w-20 h-28 mx-auto">
                        {playedCard ? (
                          <div className="bg-white rounded-lg p-2 h-full flex flex-col items-center justify-center shadow-lg">
                            <div className="text-lg font-bold">{playedCard.name}</div>
                            <div className="text-sm text-gray-600">威力: {playedCard.power}</div>
                          </div>
                        ) : (
                          <div className="bg-gray-300 rounded-lg h-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs">等待出牌</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 回合控制 */}
              <div className="text-center">
                {Object.keys(playedCards).length === allPlayers.length ? (
                  <button
                    onClick={handleNextRound}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600"
                  >
                    比较结果
                  </button>
                ) : (
                  <div className="text-white">
                    等待所有玩家出牌... ({Object.keys(playedCards).length}/{allPlayers.length})
                  </div>
                )}
              </div>
            </div>

            {/* 玩家手牌 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">您的手牌</h3>
              <div className="flex flex-wrap gap-2">
                {hand.map(card => (
                  <button
                    key={card.id}
                    onClick={() => handleCardPlay(card)}
                    disabled={!gameState.isMyTurn || playedCards[localPlayer.id]}
                    className={`w-16 h-24 bg-white border-2 rounded-lg p-2 text-xs font-bold transition-all hover:shadow-lg ${
                      selectedCard?.id === card.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${
                      !gameState.isMyTurn || playedCards[localPlayer.id]
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className="text-center">
                      <div>{card.name}</div>
                      <div className="text-blue-600 mt-1">{card.power}</div>
                    </div>
                  </button>
                ))}
              </div>
              {hand.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  手牌已全部出完
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-4">
            {/* 玩家状态 */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold mb-3">玩家状态</h3>
              <div className="space-y-2">
                {allPlayers.map(player => {
                  const isConnected = connectedPlayers.some(p => p.id === player.id) || player.id === localPlayer.id;
                  const hasPlayed = !!playedCards[player.id];
                  
                  return (
                    <div key={player.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        <span>{player.name}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        hasPlayed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hasPlayed ? '已出牌' : '等待中'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 游戏日志 */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="font-bold mb-3">游戏日志</h3>
              <div className="h-48 overflow-y-auto text-sm space-y-1">
                {gameLog.map((log, index) => (
                  <div key={index} className="text-gray-700 py-1 border-b border-gray-100">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI助手面板 */}
      <AIAssistantPanel
        gameTemplate={gameTemplate}
        gameState={templateGameState}
        currentPlayer={localPlayer}
        isVisible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        config={{
          enableRuleQuery: true,
          enableGameHints: true,
          enableStrategyTips: true,
          hintFrequency: 'medium',
          language: 'zh-CN'
        }}
      />
    </div>
  );
};

export default GameInterface; 