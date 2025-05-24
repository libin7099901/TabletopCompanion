// 🎯 五子棋游戏实现

import {
  GameState,
  GameAction,
  GameRules,
  WinResult,
  ActionType,
  BoardState,
  // BoardCell,
  GamePiece,
  Position
} from '../types/game';

export class GomokuRules implements GameRules {
  private readonly BOARD_SIZE = 15;
  private readonly WIN_LENGTH = 5;

  // === 规则验证 ===
  
  validateAction(state: GameState, action: GameAction): boolean {
    if (action.type !== 'place') {
      return false;
    }

    const { x, y } = action.data as Position;
    
    // 检查坐标有效性
    if (x < 0 || x >= this.BOARD_SIZE || y < 0 || y >= this.BOARD_SIZE) {
      return false;
    }

    // 检查位置是否为空
    if (!state.board) return false;
    
    const cell = state.board.cells[y][x];
    return !cell.piece;
  }

  // === 动作执行 ===

  executeAction(state: GameState, action: GameAction): GameState {
    const newState = { ...state };
    
    if (action.type === 'place') {
      newState.board = this.placePiece(state.board!, action);
    }

    return newState;
  }

  private placePiece(board: BoardState, action: GameAction): BoardState {
    const { x, y } = action.data as Position;
    const newBoard = JSON.parse(JSON.stringify(board)) as BoardState;
    
    // 创建新棋子
    const piece: GamePiece = {
      id: `piece_${Date.now()}`,
      playerId: action.playerId,
      type: 'token',
      position: { x, y },
      isSelected: false,
      canMove: false
    };

    // 放置棋子
    newBoard.cells[y][x].piece = piece;
    newBoard.pieces.push(piece);

    return newBoard;
  }

  // === 胜利条件检查 ===

  checkWinCondition(state: GameState): WinResult | null {
    if (!state.board) return null;

    // 检查每个玩家是否获胜
    for (const player of state.players) {
      if (this.checkPlayerWin(state.board, player.id)) {
        return {
          winnerId: player.id,
          isDraw: false,
          reason: `${player.name} 连成五子获胜！`,
          finalScores: Object.fromEntries(
            state.players.map(p => [p.id, p.id === player.id ? 1 : 0])
          )
        };
      }
    }

    // 检查是否平局（棋盘满）
    if (this.isBoardFull(state.board)) {
      return {
        isDraw: true,
        reason: '棋盘已满，平局！',
        finalScores: Object.fromEntries(
          state.players.map(p => [p.id, 0])
        )
      };
    }

    return null;
  }

  private checkPlayerWin(board: BoardState, playerId: string): boolean {
    const pieces = board.pieces.filter(p => p.playerId === playerId);
    
    for (const piece of pieces) {
      // 检查四个方向：水平、垂直、对角线
      const directions = [
        { dx: 1, dy: 0 },   // 水平
        { dx: 0, dy: 1 },   // 垂直
        { dx: 1, dy: 1 },   // 左上-右下对角线
        { dx: 1, dy: -1 }   // 左下-右上对角线
      ];

      for (const direction of directions) {
        if (this.checkDirection(board, piece.position, direction, playerId)) {
          return true;
        }
      }
    }

    return false;
  }

  private checkDirection(
    board: BoardState, 
    startPos: Position, 
    direction: { dx: number; dy: number }, 
    playerId: string
  ): boolean {
    let count = 1; // 包含起始棋子

    // 向前检查
    let x = startPos.x + direction.dx;
    let y = startPos.y + direction.dy;
    
    while (this.isValidPosition(x, y) && this.getPieceAt(board, x, y)?.playerId === playerId) {
      count++;
      x += direction.dx;
      y += direction.dy;
    }

    // 向后检查
    x = startPos.x - direction.dx;
    y = startPos.y - direction.dy;
    
    while (this.isValidPosition(x, y) && this.getPieceAt(board, x, y)?.playerId === playerId) {
      count++;
      x -= direction.dx;
      y -= direction.dy;
    }

    return count >= this.WIN_LENGTH;
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE;
  }

  private getPieceAt(board: BoardState, x: number, y: number): GamePiece | undefined {
    return board.cells[y][x].piece;
  }

  private isBoardFull(board: BoardState): boolean {
    return board.pieces.length >= this.BOARD_SIZE * this.BOARD_SIZE;
  }

  // === 游戏逻辑 ===

  getValidActions(state: GameState, playerId: string): ActionType[] {
    if (state.status !== 'active') return [];
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) return [];

    return ['place'];
  }

  getNextPlayer(state: GameState): number {
    return (state.currentPlayerIndex + 1) % state.players.length;
  }

  calculateScore(state: GameState, playerId: string): number {
    const winResult = this.checkWinCondition(state);
    if (winResult && winResult.winnerId === playerId) {
      return 1;
    }
    return 0;
  }
}

// === 工厂函数 ===

export function createGomokuGame(): {
  rules: GameRules;
  initialState: Partial<GameState>;
} {
  const rules = new GomokuRules();
  
  // 初始化棋盘
  const board: BoardState = {
    width: 15,
    height: 15,
    cells: Array(15).fill(null).map((_, y) =>
      Array(15).fill(null).map((_, x) => ({
        x,
        y,
        type: 'normal' as const,
        isHighlighted: false,
        isSelectable: true
      }))
    ),
    pieces: []
  };

  const initialState: Partial<GameState> = {
    board,
    phase: 'playing'
  };

  return { rules, initialState };
}

// === AI策略（简单实现） ===

export class GomokuAI {
  private rules: GomokuRules;

  constructor(rules: GomokuRules) {
    this.rules = rules;
  }

  // 简单AI：找最佳放置位置
  public getBestMove(state: GameState, playerId: string): Position | null {
    if (!state.board) return null;

    const availablePositions = this.getAvailablePositions(state.board);
    if (availablePositions.length === 0) return null;

    // 优先级策略
    const winMove = this.findWinningMove(state, playerId);
    if (winMove) return winMove;

    const blockMove = this.findBlockingMove(state, playerId);
    if (blockMove) return blockMove;

    const strategicMove = this.findStrategicMove(state, playerId);
    if (strategicMove) return strategicMove;

    // 随机选择
    return availablePositions[Math.floor(Math.random() * availablePositions.length)];
  }

  private getAvailablePositions(board: BoardState): Position[] {
    const positions: Position[] = [];
    
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        if (!board.cells[y][x].piece) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  private findWinningMove(state: GameState, playerId: string): Position | null {
    const availablePositions = this.getAvailablePositions(state.board!);
    
    for (const pos of availablePositions) {
      // 模拟放置棋子
      const testAction = {
        id: 'test',
        playerId,
        type: 'place' as ActionType,
        data: pos,
        timestamp: '',
        isValid: true
      };

      const testState = this.rules.executeAction(state, testAction);
      const winResult = this.rules.checkWinCondition(testState);
      
      if (winResult && winResult.winnerId === playerId) {
        return pos;
      }
    }

    return null;
  }

  private findBlockingMove(state: GameState, playerId: string): Position | null {
    const opponents = state.players.filter(p => p.id !== playerId);
    
    for (const opponent of opponents) {
      const blockMove = this.findWinningMove(state, opponent.id);
      if (blockMove) {
        return blockMove;
      }
    }

    return null;
  }

  private findStrategicMove(state: GameState, playerId: string): Position | null {
    // 简单策略：靠近现有棋子
    const myPieces = state.board!.pieces.filter(p => p.playerId === playerId);
    
    if (myPieces.length === 0) {
      // 第一步：选择中心附近
      return { x: 7, y: 7 };
    }

    // 找到靠近现有棋子的空位
    const availablePositions = this.getAvailablePositions(state.board!);
    
    let bestPos = availablePositions[0];
    let minDistance = Infinity;

    for (const pos of availablePositions) {
      for (const piece of myPieces) {
        const distance = Math.abs(pos.x - piece.position.x) + Math.abs(pos.y - piece.position.y);
        if (distance < minDistance) {
          minDistance = distance;
          bestPos = pos;
        }
      }
    }

    return bestPos;
  }
} 