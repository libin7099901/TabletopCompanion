// 本地存储服务
import { GameTemplate, Player, Room } from '../types/common';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // 玩家相关存储
  public savePlayer(player: Player): void {
    localStorage.setItem('current_player', JSON.stringify(player));
  }

  public getPlayer(): Player | null {
    const data = localStorage.getItem('current_player');
    return data ? JSON.parse(data) : null;
  }

  public clearPlayer(): void {
    localStorage.removeItem('current_player');
  }

  // 游戏模板存储
  public saveTemplate(template: GameTemplate): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem('game_templates', JSON.stringify(templates));
  }

  public getTemplates(): GameTemplate[] {
    const data = localStorage.getItem('game_templates');
    return data ? JSON.parse(data) : [];
  }

  public getTemplate(id: string): GameTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }

  public deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem('game_templates', JSON.stringify(templates));
  }

  // 房间历史存储
  public saveRoomHistory(room: Room): void {
    const history = this.getRoomHistory();
    const existingIndex = history.findIndex(r => r.id === room.id);
    
    if (existingIndex >= 0) {
      history[existingIndex] = room;
    } else {
      history.unshift(room); // 添加到开头
      // 限制历史记录数量
      if (history.length > 50) {
        history.splice(50);
      }
    }
    
    localStorage.setItem('room_history', JSON.stringify(history));
  }

  public getRoomHistory(): Room[] {
    const data = localStorage.getItem('room_history');
    return data ? JSON.parse(data) : [];
  }

  public clearRoomHistory(): void {
    localStorage.removeItem('room_history');
  }

  // 应用设置存储
  public saveSetting(key: string, value: any): void {
    const settings = this.getSettings();
    settings[key] = value;
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }

  public getSetting(key: string, defaultValue?: any): any {
    const settings = this.getSettings();
    return settings[key] !== undefined ? settings[key] : defaultValue;
  }

  public getSettings(): Record<string, any> {
    const data = localStorage.getItem('app_settings');
    return data ? JSON.parse(data) : {};
  }

  public clearAllData(): void {
    localStorage.removeItem('current_player');
    localStorage.removeItem('game_templates');
    localStorage.removeItem('room_history');
    localStorage.removeItem('app_settings');
  }
} 