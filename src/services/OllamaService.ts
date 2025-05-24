// 🤖 Ollama AI 服务

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
  isThinkingModel?: boolean;
}

export interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = 'http://localhost:11434', timeout: number = 30000) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除尾部斜杠
    this.timeout = timeout;
  }

  // === 模型管理 ===

  /**
   * 获取可用模型列表
   */
  async getModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.models || [];

      // 识别思考模型并标记
      return models.map((model: any) => ({
        ...model,
        isThinkingModel: this.isThinkingModel(model.name)
      }));
    } catch (error) {
      console.error('获取Ollama模型列表失败:', error);
      throw new Error(`无法连接到Ollama服务 (${this.baseUrl}): ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检测是否为思考模型
   */
  private isThinkingModel(modelName: string): boolean {
    const thinkingKeywords = [
      'thinking', 'reason', 'analysis', 'cot', 'chain-of-thought',
      'qwen2.5-coder', 'deepseek', 'o1', 'reasoning'
    ];
    
    const name = modelName.toLowerCase();
    return thinkingKeywords.some(keyword => name.includes(keyword));
  }

  /**
   * 测试模型连接
   */
  async testModel(modelName: string): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const testPrompt = this.getTestPrompt(modelName);
      const response = await this.generateResponse(modelName, testPrompt);
      
      return {
        success: true,
        response: response.response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 根据模型类型生成测试提示词
   */
  private getTestPrompt(modelName: string): string {
    if (this.isThinkingModel(modelName)) {
      return `请简单回答：1+1等于多少？请直接给出答案，不需要详细推理过程。`;
    } else {
      return `你好！请简单介绍一下你自己，告诉我你是什么AI模型。`;
    }
  }

  // === 对话生成 ===

  /**
   * 生成AI回复
   */
  async generateResponse(
    modelName: string, 
    prompt: string, 
    options: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      context?: number[];
    } = {}
  ): Promise<OllamaResponse> {
    try {
      const isThinking = this.isThinkingModel(modelName);
      const adaptedPrompt = this.adaptPromptForModel(prompt, isThinking);

      const requestBody = {
        model: modelName,
        prompt: adaptedPrompt,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.9,
          num_predict: options.max_tokens ?? 2048,
          ...options
        },
        context: options.context
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Ollama生成回复失败:', error);
      throw new Error(`生成回复失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据模型类型适配提示词
   */
  private adaptPromptForModel(prompt: string, isThinkingModel: boolean): string {
    if (isThinkingModel) {
      // 思考模型：鼓励详细思考过程
      return `请仔细思考以下问题，你可以展示你的思考过程：

${prompt}

请提供详细的分析和推理过程。`;
    } else {
      // 普通模型：简洁直接的回答
      return `请回答以下问题，保持回答简洁明了：

${prompt}`;
    }
  }

  // === 流式响应 ===

  /**
   * 流式生成响应
   */
  async *generateStreamResponse(
    modelName: string,
    prompt: string,
    options: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      context?: number[];
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const isThinking = this.isThinkingModel(modelName);
      const adaptedPrompt = this.adaptPromptForModel(prompt, isThinking);

      const requestBody = {
        model: modelName,
        prompt: adaptedPrompt,
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.9,
          num_predict: options.max_tokens ?? 2048,
        },
        context: options.context
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  yield data.response;
                }
                if (data.done) {
                  return;
                }
              } catch (e) {
                console.warn('解析流数据失败:', line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Ollama流式生成失败:', error);
      throw new Error(`流式生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // === 工具方法 ===

  /**
   * 检查服务连接状态
   */
  async checkConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const version = await response.json();
        return {
          connected: true,
          version: version.version
        };
      } else {
        return {
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : '连接失败'
      };
    }
  }

  /**
   * 更新基础URL
   */
  updateBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl.replace(/\/$/, '');
  }

  /**
   * 获取当前配置
   */
  getConfig(): { baseUrl: string; timeout: number } {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeout
    };
  }
} 