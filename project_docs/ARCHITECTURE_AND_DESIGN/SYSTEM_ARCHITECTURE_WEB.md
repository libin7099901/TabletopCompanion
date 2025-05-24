# **系统架构设计 - 桌游伴侣 (网页版)**

**版本**: 0.1 (初步设计)
**日期**: 2025-05-24
**负责人**: SystemArchitectAI (维克托)

## **1. 概述**

本文档描述了"桌游伴侣"网页版的初步高层系统架构。项目旨在提供一个高度可定制化的游戏流程引导、智能规则查询和复杂计分辅助的网页应用，核心特点是无中央服务器依赖的P2P协作和UGC游戏模板。

**技术栈核心**:
*   **前端**: TypeScript, React
*   **构建工具**: Vite
*   **P2P通信**: WebRTC
*   **客户端存储**: IndexedDB, localStorage
*   **文件处理**: JSZip (或类似库)

## **2. 架构目标**

*   **模块化**: 清晰划分不同功能的模块，易于开发和维护。
*   **可扩展性**: 方便未来添加新功能或支持更复杂的游戏模板。
*   **性能**: 保证流畅的用户交互和游戏体验。
*   **无服务器核心**: 核心功能不依赖后端服务器，玩家间直接通信。

## **3. 高层组件图**

```mermaid
graph TD
    subgraph BROWSER_CLIENT [浏览器客户端]
        subgraph UI_LAYER [UI层 (React Components)]
            Comp_RoomView["房间视图 (RoomView.tsx)"]
            Comp_GameView["游戏视图 (GameView.tsx)"]
            Comp_TemplateManager["模板管理器视图 (TemplateManagerView.tsx)"]
            Comp_Chat["聊天/引导区 (Chat.tsx)"]
            Comp_Indicators["游戏指示器 (Indicators.tsx)"]
            Comp_LLMQuery["LLM查询输入 (LLMQuery.tsx)"]
        end

        subgraph APPLICATION_LOGIC_LAYER [应用逻辑层 (Services/Hooks)]
            Service_P2P["P2P通信服务 (P2PService.ts)"]
            Service_GameState["游戏状态管理服务 (GameStateService.ts)"]
            Service_Template["模板服务 (TemplateService.ts)"]
            Service_LLM["LLM服务 (LLMService.ts)"]
            Service_Storage["本地存储服务 (StorageService.ts)"]
            Hook_Auth["用户认证/状态钩子 (useAuth.ts)"]
        end

        subgraph CORE_LIBRARIES [核心库/API]
            Lib_WebRTC["WebRTC API"]
            Lib_IndexedDB["IndexedDB API"]
            Lib_LocalStorage["LocalStorage API"]
            Lib_JSZip["JSZip"]
            Lib_React["React"]
        end

        UI_LAYER --> APPLICATION_LOGIC_LAYER
        APPLICATION_LOGIC_LAYER --> CORE_LIBRARIES
        Service_P2P --> Lib_WebRTC
        Service_Storage --> Lib_IndexedDB
        Service_Storage --> Lib_LocalStorage
        Service_Template --> Lib_JSZip
        Service_Template --> Service_Storage
        Service_GameState --> Service_Storage
        Service_GameState --> Service_P2P
        Comp_GameView --> Service_GameState
        Comp_Chat --> Service_P2P
        Comp_Chat --> Service_LLM
    end

    Ext_LLM["外部LLM服务 (Ollama等)"]
    Ext_STUN["公共STUN服务器"]

    Service_LLM --> Ext_LLM
    Service_P2P --> Ext_STUN
```

**组件说明**:

*   **UI层 (React Components)**:
    *   负责用户界面的展示和用户交互的直接处理。
    *   `RoomView.tsx`: 房间创建、加入、玩家列表等。
    *   `GameView.tsx`: 游戏主界面，包含游戏指示器、操作按钮等。
    *   `TemplateManagerView.tsx`: 游戏模板的导入、删除、列表展示。
    *   `Chat.tsx`: 游戏流程引导信息显示、玩家聊天、LLM问答区域。
    *   `Indicators.tsx`: 动态显示游戏模板定义的状态指示器。
    *   `LLMQuery.tsx`: 用户输入LLM查询的组件。
*   **应用逻辑层 (Services/Hooks)**:
    *   封装核心业务逻辑，与UI层解耦。
    *   `P2PService.ts`: 封装WebRTC连接建立、数据发送/接收、NAT穿透（STUN）逻辑。
    *   `GameStateService.ts`: 管理当前游戏状态（如回合、分数、玩家数据），处理游戏逻辑（基于模板），同步状态给其他玩家。
    *   `TemplateService.ts`: 负责游戏模板的导入（解压ZIP、解析JSON/YAML）、存储和加载。
    *   `LLMService.ts`: 负责构建LLM请求（包含上下文）、调用外部LLM API、处理响应。
    *   `StorageService.ts`: 封装对浏览器本地存储（IndexedDB、LocalStorage）的访问，用于存储用户设置、模板元数据、游戏状态快照等。
    *   `useAuth.ts`: 处理用户首次设置用户名/头像及后续状态管理。
*   **核心库/API**:
    *   浏览器提供的原生API或第三方库，是应用逻辑层的基础。

*   **外部服务**:
    *   `外部LLM服务`: 如Ollama API。
    *   `公共STUN服务器`: 用于辅助WebRTC的NAT穿透。

## **4. 关键技术点实现思路概述**

### **4.1. P2P通信与状态同步 (WebRTC)**

1.  **连接建立**: 
    *   房主创建房间后，生成一个包含其连接信息（通过STUN获取的候选地址）的"房间邀请码"。
    *   其他玩家通过输入邀请码，获取房主候选地址。
    *   双方通过信令交换（手动通过邀请码传递初始信令，后续可通过已建立的数据通道）完成WebRTC连接协商和建立。
2.  **数据通道**: 使用WebRTC的 `RTCDataChannel` 在玩家间建立可靠或不可靠数据通道。
    *   **游戏状态同步**: 关键游戏状态变化（如玩家操作、分数更新、回合变更）通过可靠数据通道广播给所有玩家。
    *   **聊天信息**: 通过数据通道发送。
    *   **LLM共享（如果实现）**: 查询和结果可通过数据通道在房主和成员间传递。
3.  **消息格式**: 采用JSON格式定义P2P消息体，包含消息类型、发送者、负载等。

### **4.2. 游戏模板处理**

1.  **导入与解压**: 用户选择本地ZIP包后，使用 `JSZip` (或类似库) 在前端解压。
2.  **模板结构**: 模板包含 `game_info.json`, `llm_rules_document.md`, `ui_definition.json`, `game_logic.json` 等文件。
3.  **解析**: `TemplateService.ts` 解析这些JSON/Markdown文件，将其转换为内部可用的数据结构。
    *   `ui_definition.json` 用于动态渲染游戏界面组件和指示器。
    *   `game_logic.json` 定义了游戏流程、行动、条件和效果，由 `GameStateService.ts` 执行。
4.  **存储**: 模板文件内容（或其解析后的关键数据）存储在客户端的 `IndexedDB` 中，供后续加载。

### **4.3. LLM集成**

1.  **客户端调用**: `LLMService.ts` 直接通过 `fetch` API 调用用户配置的LLM服务地址（如本地Ollama）。
2.  **上下文构建**: 调用前，根据当前游戏状态 (`GameStateService.ts`)、加载的游戏模板规则 (`TemplateService.ts`) 和用户问题，构建完整的上下文提示 (prompt)。
3.  **安全考虑**: 由于API密钥等敏感信息可能在客户端处理，需要提示用户注意安全风险，尤其是对于公共LLM服务。对于本地Ollama则风险较低。

### **4.4. 游戏逻辑执行**

*   `GameStateService.ts` 内部包含一个游戏逻辑引擎，该引擎能够解释并执行从 `game_logic.json` 解析出的规则。
*   例如，当一个玩家完成操作，引擎会根据当前状态和模板逻辑，确定下一个状态、哪个玩家行动、更新哪些指示器等。
*   状态的改变会通过 `P2PService.ts` 同步给其他玩家。

## **5. 项目目录结构建议 (src/)**

```
src/
├── App.tsx                   # 应用主入口组件
├── main.tsx                  # React渲染入口
├── assets/                   # 静态资源 (图片, 字体等)
├── components/               # 通用UI组件 (如Button, Modal)
│   ├── common/
│   └── layout/
├── features/                 # 按功能模块划分的组件与逻辑
│   ├── room/                 # 房间创建、加入、管理
│   │   ├── components/
│   │   ├── hooks/
│   │   └── RoomView.tsx
│   ├── game/                 # 游戏主界面与逻辑
│   │   ├── components/       # (Chat, Indicators, ActionButtons)
│   │   ├── hooks/
│   │   └── GameView.tsx
│   ├── template/             # 模板管理
│   │   ├── components/
│   │   └── TemplateManagerView.tsx
│   └── auth/                 # 用户身份设置
│       └── useAuth.ts
├── services/                 # 应用核心服务 (与UI无关的逻辑)
│   ├── P2PService.ts
│   ├── GameStateService.ts
│   ├── TemplateService.ts
│   ├── LLMService.ts
│   ├── StorageService.ts
├── hooks/                    # 通用React Hooks
├── contexts/                 # React Contexts (如AppContext)
├── types/                    # TypeScript类型定义
│   ├── domain.ts             # (GameState, Player, Template等核心领域对象)
│   └── p2p.ts                # (P2P消息类型)
├── styles/                   # 全局样式和主题
├── utils/                    # 通用工具函数
└── config/                   # 应用配置 (如STUN服务器列表)
```

## **6. 后续步骤**

*   细化各服务和组件的接口设计。
*   设计更详细的数据模型 (特别是模板内部结构和游戏状态的结构)。
*   原型验证P2P连接和数据同步。

---
*本文档将随项目进展持续更新。* 