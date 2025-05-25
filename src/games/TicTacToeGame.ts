// ⭕ 井字棋游戏

import {
  GameState,
  GameAction,
  GameRules,
  WinResult,
  ActionType,
  BoardState,
  BoardCell,
  GamePiece
} from '../types/game';

// === 井字棋规则 ===

export class TicTacToeRules implements GameRules {
  validateAction(state: GameState, action: GameAction): boolean {
    if (action.type !== 'place') return false;
    if (state.phase !== 'playing') return false;
    
    const { position } = action.data;
    
    // 检查位置有效性
    if (position < 0 || position >= 9) return false;
    
    // 检查位置是否已占用
    const board = state.board;
    if (!board) return false;
    
    const row = Math.floor(position / 3);
    const col = position % 3;
    return board.cells[row][col].piece === undefined;
  }

  executeAction(state: GameState, action: GameAction): GameState {
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    
    if (action.type === 'place') {
      return this.executePlaceAction(newState, action);
    }
    
    return newState;
  }

  private executePlaceAction(state: GameState, action: GameAction): GameState {
    const { position } = action.data;
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // 确保棋盘已初始化
    if (!state.board) {
      state.board = this.createInitialBoard();
    }
    
    const row = Math.floor(position / 3);
    const col = position % 3;
    
    // 创建新棋子
    const piece: GamePiece = {
      id: `piece_${position}_${Date.now()}`,
      playerId: currentPlayer.id,
      type: 'token',
      position: { x: col, y: row },
      isSelected: false,
      canMove: false
    };
    
    // 放置棋子
    state.board.cells[row][col].piece = piece;
    state.board.pieces.push(piece);
    
    // 记录历史
    state.history.push(action);
    
    // 检查胜利条件
    const winResult = this.checkWinCondition(state);
    if (winResult) {
      state.status = 'finished';
      state.phase = 'finished';
    } else if (this.isBoardFull(state.board)) {
      // 平局
      state.status = 'finished';
      state.phase = 'finished';
    } else {
      // 切换玩家
      state.currentPlayerIndex = this.getNextPlayer(state);
    }
    
    return state;
  }

  private createInitialBoard(): BoardState {
    const cells: BoardCell[][] = [];
    
    for (let row = 0; row < 3; row++) {
      cells[row] = [];
      for (let col = 0; col < 3; col++) {
        cells[row][col] = {
          x: col,
          y: row,
          type: 'normal',
          isHighlighted: false,
          isSelectable: true
        };
      }
    }
    
    return {
      width: 3,
      height: 3,
      cells,
      pieces: []
    };
  }

  checkWinCondition(state: GameState): WinResult | null {
    const board = state.board;
    if (!board) return null;
    
    // 获胜条件：3个连线
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横行
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // 竖列
      [0, 4, 8], [2, 4, 6]             // 对角线
    ];
    
    for (const condition of winConditions) {
      const [a, b, c] = condition;
      const posA = { row: Math.floor(a / 3), col: a % 3 };
      const posB = { row: Math.floor(b / 3), col: b % 3 };
      const posC = { row: Math.floor(c / 3), col: c % 3 };
      
      const pieceA = board.cells[posA.row][posA.col].piece;
      const pieceB = board.cells[posB.row][posB.col].piece;
      const pieceC = board.cells[posC.row][posC.col].piece;
      
      if (pieceA && pieceB && pieceC &&
          pieceA.playerId === pieceB.playerId && 
          pieceB.playerId === pieceC.playerId) {
        
        return {
          winnerId: pieceA.playerId,
          isDraw: false,
          reason: 'line_complete',
          finalScores: this.calculateFinalScores(state)
        };
      }
    }
    
    return null;
  }

  private isBoardFull(board: BoardState): boolean {
    return board.pieces.length === 9;
  }

  private calculateFinalScores(state: GameState): Record<string, number> {
    const scores: Record<string, number> = {};
    state.players.forEach(player => {
      scores[player.id] = this.calculateScore(state, player.id);
    });
    return scores;
  }

  getValidActions(state: GameState, playerId: string): ActionType[] {
    if (state.phase !== 'playing') return [];
    if (state.players[state.currentPlayerIndex].id !== playerId) return [];
    
    return ['place'];
  }

  getNextPlayer(state: GameState): number {
    return (state.currentPlayerIndex + 1) % state.players.length;
  }

  calculateScore(state: GameState, playerId: string): number {
    const winResult = this.checkWinCondition(state);
    if (winResult && winResult.winnerId === playerId) return 1;
    return 0;
  }
}

// === 游戏创建函数 ===

export function createTicTacToeGame(): {
  rules: GameRules;
  initialState: Partial<GameState>;
} {
  return {
    rules: new TicTacToeRules(),
    initialState: {
      id: 'tic-tac-toe-' + Date.now(),
      templateId: 'ticTacToe',
      status: 'preparing',
      phase: 'setup',
      round: 1,
      currentPlayerIndex: 0,
      players: [],
      history: [],
      score: {},
      startTime: new Date().toISOString(),
      settings: {
        timeLimit: 60,
        autoSkip: false,
        allowUndo: true,
        showHints: true,
        difficulty: 'medium'
      }
    }
  };
}

// === AI玩家 ===

export class TicTacToeAI {
  public getBestMove(state: GameState, playerId: string): number | null {
    const board = state.board;
    if (!board) return null;
    
    const opponent = state.players.find(p => p.id !== playerId);
    if (!opponent) return null;
    
    // 转换为简单数组用于算法
    const simpleBoard = this.boardToArray(board);
    
    // 使用Minimax算法
    const bestMove = this.minimax(simpleBoard, playerId, opponent.id, true);
    return bestMove.position;
  }
  
  private boardToArray(board: BoardState): (string | null)[] {
    const result: (string | null)[] = Array(9).fill(null);
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const piece = board.cells[row][col].piece;
        if (piece) {
          result[row * 3 + col] = piece.playerId;
        }
      }
    }
    
    return result;
  }
  
  private minimax(
    board: (string | null)[], 
    aiPlayer: string, 
    humanPlayer: string, 
    isMaximizing: boolean, 
    depth = 0
  ): { position: number; score: number } {
    // 评估当前局面
    const score = this.evaluateBoard(board, aiPlayer, humanPlayer);
    
    // 终止条件
    if (score !== 0 || this.isBoardFull(board) || depth > 6) {
      return { position: -1, score: score - depth };
    }
    
    const availableSpots = this.getEmptySpots(board);
    const moves: Array<{ position: number; score: number }> = [];
    
    for (const spot of availableSpots) {
      const newBoard = [...board];
      newBoard[spot] = isMaximizing ? aiPlayer : humanPlayer;
      
      const result = this.minimax(newBoard, aiPlayer, humanPlayer, !isMaximizing, depth + 1);
      moves.push({ position: spot, score: result.score });
    }
    
    if (isMaximizing) {
      return moves.reduce((best, move) => 
        move.score > best.score ? move : best
      );
    } else {
      return moves.reduce((best, move) => 
        move.score < best.score ? move : best
      );
    }
  }
  
  private evaluateBoard(board: (string | null)[], aiPlayer: string, humanPlayer: string): number {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (const condition of winConditions) {
      const [a, b, c] = condition;
      if (board[a] === board[b] && board[b] === board[c]) {
        if (board[a] === aiPlayer) return 10;
        if (board[a] === humanPlayer) return -10;
      }
    }
    
    return 0;
  }
  
  private getEmptySpots(board: (string | null)[]): number[] {
    return board.map((cell, index) => cell === null ? index : null)
               .filter(val => val !== null) as number[];
  }
  
  private isBoardFull(board: (string | null)[]): boolean {
    return board.every(cell => cell !== null);
  }
} 