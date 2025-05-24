# **项目核心上下文 (`PROJECT_CONTEXT.md`)**

**最后更新时间**: `2025-01-27T15:32:00.000Z`
**最后更新者**: `OrchestratorAgent`

**注意**: 本文档是您当前项目的"单一事实来源"，由 `OrchestratorAgent` 全权负责动态维护。请勿手动修改此文件的核心追踪信息部分，除非得到AI明确指导。

## **1. 项目概览**

*   **项目名称**: `桌游伴侣 (Tabletop Companion)`
*   **项目目标**: `通过网页应用，提供高度可定制化的游戏流程引导、智能规则查询和复杂计分辅助，让玩家享受更流畅、更专注的桌游体验。`
*   **当前阶段**: `核心功能开发中期`
*   **项目状态**: `进行中 - 基础架构完成，正在开发WebRTC多人协作功能`

## **2. 关键决策与里程碑 (本项目)**

*由 `OrchestratorAgent` 在关键决策或里程碑达成时记录。*

| 日期       | 决策/里程碑描述                                  | 决策者/负责人        | 相关文档/链接 (指向本项目内文件)                 |
| ---------- | ------------------------------------------------ | -------------------- | ------------------------------------------------ |
| `2025-05-24` | `项目目标调整：核心产品形态从安卓应用变更为网页应用，安卓版本推后。` | `用户 & OrchestratorAgent` | `project_docs/产品需求文档 - 桌游伴侣.md` |
| `2025-01-27` | `WebRTC技术选型确认：采用原生WebRTC API + 自建WebSocket信令服务器` | `用户 & OrchestratorAgent` | `project_docs/AI_AGENT_PROGRESS.md` |
| `2025-01-27` | `游戏模板系统架构确认：可扩展模板设计，初期支持纸牌和象棋规则` | `用户 & OrchestratorAgent` | `project_docs/AI_AGENT_PROGRESS.md` |

## **3. 核心项目文档索引 (本项目)**

*由 `OrchestratorAgent` 动态维护，包含本项目实际创建或修改的关键文档。*

### **A. 项目管理与规划**
*   **项目进度跟踪**: `project_docs/AI_AGENT_PROGRESS.md` (包含详细任务状态)
*   **高级战略规划**: `project_docs/ACTION_PLAN_MASTER.md` (初始战略参考)
*   **本项目上下文**: `project_docs/PROJECT_CONTEXT.md` (本文档)
*   **阶段验证指南**: `project_docs/AI_STAGE_VALIDATION_GUIDE.md` (AI行为规范)
*   **自定义验证规则** (如果使用): `project_docs/custom_validation_rules.md`
*   **提示词开发者指南**: `project_docs/PROMPT_DEVELOPER_GUIDELINES.md` (新AI角色创建规范)

### **F. AI角色定义文档**
*   **WebRTC开发AI角色**: `PromptX/domain/custom/WebRTCDeveloperAI.role.md` (专门处理多人协作功能开发)
*   **其他专业AI角色**: `PromptX/domain/custom/` (包含多个专业开发角色)

### **B. 需求与设计文档**
*   `project_docs/REQUIREMENTS/{{FSD_FILENAME}}.md` (功能规格说明书)
*   `project_docs/REQUIREMENTS/{{USER_STORIES_FILENAME}}.md` (用户故事)
*   `project_docs/ARCHITECTURE_AND_DESIGN/{{SYSTEM_ARCHITECTURE_FILENAME}}.md` (系统架构)
*   `{{OrchestratorAgent根据实际生成的其他关键需求和设计文档在此处添加索引}}`

### **C. 技术文档**
*   `project_docs/ARCHITECTURE_AND_DESIGN/{{TECHNICAL_STACK_FILENAME}}.md` (技术栈详情)
*   `{{OrchestratorAgent根据实际生成的其他关键技术文档在此处添加索引}}`

### **D. 测试文档**
*   `project_docs/tests/{{TEST_PLAN_FILENAME}}.md` (测试计划)
*   `{{OrchestratorAgent根据实际生成的其他关键测试文档在此处添加索引}}`

### **E. 源代码与构建**
*   `src/` (源代码根目录)
*   `{{链接到主要的构建脚本或配置文件}}`

## **4. 技术栈概要 (本项目)**

*由 `SystemArchitectAI` 初步设定，`OrchestratorAgent` 确认并记录。*

*   **前端**: `TypeScript, React`
*   **后端**: `轻量级 Node.js (Express/Fastify) 或 Serverless Functions (可选，用于辅助功能), WebRTC (P2P核心)`
*   **数据库**: `浏览器端存储 (IndexedDB, localStorage)`
*   **主要框架/库**: `React, WebRTC, JSZip (或类似库用于解压)`
*   **开发语言**: `TypeScript/JavaScript`
*   **构建工具**: `Vite`
*   **版本控制**: Git

## **5. OrchestratorAgent 当前关注点**

*由 `OrchestratorAgent` 更新，反映其当前正在处理或监控的核心事项。*

*   **当前主要任务**: `制定并启动WebRTC多人协作功能开发计划`
*   **等待用户输入**: `需要用户确认WebRTC库选择偏好和游戏模板格式要求`
*   **最近的AI角色活动**: `OrchestratorAgent更新了项目进度文档，即将指派WebRTCDeveloperAI角色`

---
*本文档由 `OrchestratorAgent` 在项目生命周期中持续更新，以确保所有参与者和AI角色拥有统一的项目视图。* 