// 游戏模板处理服务
import JSZip from 'jszip';
import { GameTemplate } from '../types/common';
import { StorageService } from './StorageService';

export class TemplateService {
  private static instance: TemplateService;
  private storageService: StorageService;

  private constructor() {
    this.storageService = StorageService.getInstance();
  }

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  // 从ZIP文件导入模板
  public async importTemplateFromZip(file: File): Promise<GameTemplate> {
    try {
      const zip = await JSZip.loadAsync(file);
      
      // 查找模板配置文件
      const configFile = zip.file('template.json');
      if (!configFile) {
        throw new Error('模板文件中缺少 template.json 配置文件');
      }

      const configContent = await configFile.async('text');
      const template: GameTemplate = JSON.parse(configContent);

      // 验证模板格式
      this.validateTemplate(template);

      // 处理资源文件（如图片、音频等）
      await this.processTemplateAssets(zip, template);

      // 保存到本地存储
      this.storageService.saveTemplate(template);

      return template;
    } catch (error) {
      throw new Error(`导入模板失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 验证模板格式
  private validateTemplate(template: GameTemplate): void {
    const requiredFields = ['id', 'name', 'version', 'minPlayers', 'maxPlayers', 'components', 'rules', 'metadata'];
    
    for (const field of requiredFields) {
      if (!(field in template)) {
        throw new Error(`模板缺少必需字段: ${field}`);
      }
    }

    if (template.minPlayers < 1 || template.maxPlayers < template.minPlayers) {
      throw new Error('玩家数量设置无效');
    }

    if (!Array.isArray(template.components) || !Array.isArray(template.rules)) {
      throw new Error('组件和规则必须是数组');
    }
  }

  // 处理模板资源文件
  private async processTemplateAssets(zip: JSZip, template: GameTemplate): Promise<void> {
    const assetFolder = zip.folder('assets');
    if (!assetFolder) {
      return; // 没有资源文件夹是可以的
    }

    const assetPromises: Promise<void>[] = [];

    assetFolder.forEach((relativePath, file) => {
      if (!file.dir) {
        const promise = this.processAssetFile(file, relativePath, template);
        assetPromises.push(promise);
      }
    });

    await Promise.all(assetPromises);
  }

  // 处理单个资源文件
  private async processAssetFile(file: JSZip.JSZipObject, relativePath: string, template: GameTemplate): Promise<void> {
    try {
      const content = await file.async('base64');
      const mimeType = this.getMimeType(relativePath);
      const dataUrl = `data:${mimeType};base64,${content}`;

      // 将资源URL保存到模板中相应的位置
      this.updateTemplateAssetReference(template, relativePath, dataUrl);
    } catch (error) {
      console.warn(`处理资源文件 ${relativePath} 失败:`, error);
    }
  }

  // 更新模板中的资源引用
  private updateTemplateAssetReference(template: GameTemplate, assetPath: string, dataUrl: string): void {
    // 如果是缩略图
    if (assetPath.includes('thumbnail') || assetPath === 'thumb.png' || assetPath === 'thumb.jpg') {
      template.metadata.thumbnail = dataUrl;
      return;
    }

    // 更新组件中的资源引用
    template.components.forEach(component => {
      if (component.properties.image === assetPath) {
        component.properties.image = dataUrl;
      }
      if (component.properties.backgroundImage === assetPath) {
        component.properties.backgroundImage = dataUrl;
      }
    });
  }

  // 获取文件MIME类型
  private getMimeType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'json': 'application/json',
      'txt': 'text/plain'
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  // 导出模板为ZIP文件
  public async exportTemplateToZip(templateId: string): Promise<Blob> {
    const template = this.storageService.getTemplate(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    const zip = new JSZip();

    // 添加模板配置文件
    zip.file('template.json', JSON.stringify(template, null, 2));

    // 添加README文件
    const readme = this.generateReadme(template);
    zip.file('README.md', readme);

    // 如果有缩略图，添加到assets文件夹
    if (template.metadata.thumbnail) {
      const assetFolder = zip.folder('assets');
      if (assetFolder && template.metadata.thumbnail.startsWith('data:')) {
        const base64Data = template.metadata.thumbnail.split(',')[1];
        const mimeType = template.metadata.thumbnail.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        assetFolder.file(`thumbnail.${extension}`, base64Data, { base64: true });
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  // 生成README文件
  private generateReadme(template: GameTemplate): string {
    return `# ${template.name}

${template.description}

## 基本信息
- 版本: ${template.version}
- 玩家数量: ${template.minPlayers}-${template.maxPlayers}人
- 预计游戏时长: ${template.estimatedDuration}分钟
- 复杂度: ${template.metadata.complexity}
- 作者: ${template.metadata.author}

## 游戏组件
${template.components.map(c => `- ${c.name} (${c.type})`).join('\n')}

## 规则分类
${Array.from(new Set(template.rules.map(r => r.category))).map(cat => `- ${cat}`).join('\n')}

## 标签
${template.metadata.tags.join(', ')}
`;
  }

  // 获取所有本地模板
  public getLocalTemplates(): GameTemplate[] {
    return this.storageService.getTemplates();
  }

  // 删除模板
  public deleteTemplate(templateId: string): void {
    this.storageService.deleteTemplate(templateId);
  }

  // 创建示例模板
  public createSampleTemplate(): GameTemplate {
    return {
      id: 'sample-' + Date.now(),
      name: '示例桌游模板',
      description: '这是一个演示用的桌游模板，展示了基本的游戏结构',
      version: '1.0.0',
      minPlayers: 2,
      maxPlayers: 4,
      estimatedDuration: 30,
      components: [
        {
          id: 'game-board',
          type: 'board',
          name: '游戏板',
          properties: {
            width: 800,
            height: 600,
            backgroundColor: '#f0f0f0'
          }
        },
        {
          id: 'score-tracker',
          type: 'score_tracker',
          name: '计分器',
          properties: {
            maxScore: 100,
            scoreType: 'number'
          }
        }
      ],
      rules: [
        {
          id: 'setup',
          title: '游戏准备',
          description: '每位玩家选择一种颜色的棋子',
          category: '基本规则',
          priority: 1
        },
        {
          id: 'turn-order',
          title: '回合顺序',
          description: '按顺时针方向进行游戏',
          category: '基本规则',
          priority: 2
        }
      ],
      metadata: {
        author: '系统',
        tags: ['示例', '教学'],
        language: 'zh-CN',
        complexity: 'beginner',
        category: '策略游戏'
      }
    };
  }
} 