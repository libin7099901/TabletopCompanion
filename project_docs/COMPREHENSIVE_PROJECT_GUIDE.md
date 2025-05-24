# **全面 AI 驱动项目使用指南 (`COMPREHENSIVE_PROJECT_GUIDE.md`)**

**版本**: 2.0
**最后更新**: 2024-07-26 10:30:00

## **引言**

欢迎使用 AI 驱动的全自动产品开发项目框架！本指南是您的核心操作手册，旨在帮助您从项目启动到日常运营，全面、高效地与我们的人工智能助手（特别是核心协调者 `OrchestratorAgent`）协作。

本指南将综合利用 `project_docs/` 目录下的各类专业文档，为您提供一个统一的、实用的操作视角。

**建议阅读顺序**：
1.  如果您是初次接触本项目，请先阅读 [`README_USER.md`](./README_USER.md) 以了解项目愿景和基本文档结构。
2.  然后，通读本指南，它将是您日常操作的主要参考。
3.  在特定操作（如首次配置PromptX）或需要深入了解特定方面时，本指南会引导您参考更详细的专业文档。

---

## **0. 外部AI协作预构思阶段：从想法到结构化需求**

在正式启动Cursor开发环境之前，我们**强烈建议**您先使用免费的外部AI工具（如ChatGPT、Claude等）来完善您的产品构思。这个预构思阶段将为后续的专业开发奠定坚实基础。

### **0.1 为什么要先用外部AI？**

- **成本效益**：免费AI工具适合做初步的探索和构思
- **思维发散**：外部AI能帮您从多个角度思考产品
- **结构化输出**：通过引导式对话，将模糊的想法转化为结构化的需求文档
- **质量保证**：为Cursor环境提供高质量的起始输入，提高后续开发效率

### **0.2 外部AI协作操作步骤**

**步骤1：准备协作文档**
1. 打开本项目中的 [`project_docs/EXTERNAL_AI_COLLABORATION_GUIDE.md`](./EXTERNAL_AI_COLLABORATION_GUIDE.md)
2. **完整复制**该文件的全部内容（从标题开始到文档结尾）
3. 准备您的初步产品想法（哪怕只是一句话的描述）

**步骤2：启动外部AI协作**
1. 打开您选择的外部AI平台（推荐ChatGPT或Claude）
2. 开始新的对话
3. 将复制的 `EXTERNAL_AI_COLLABORATION_GUIDE.md` 内容粘贴给AI
4. 等待AI确认理解并开始引导对话

**步骤3：完成结构化对话**
外部AI将引导您完成4个阶段的深入讨论：
- **阶段1**：产品愿景与核心价值 (5-8轮对话)
- **阶段2**：功能规划与用户场景 (8-12轮对话)
- **阶段3**：技术与实现 (5-8轮对话)
- **阶段4**：商业与运营 (3-5轮对话)

**重要**：请耐心完成每个阶段，不要急于跳到结论。外部AI会通过提问帮您深入思考。

**步骤4：获取结构化输出**
对话完成后，外部AI会生成一份完整的产品需求文档，包含：
- 产品概览
- 问题陈述与解决方案
- 用户画像与使用场景
- 功能需求（核心功能和增强功能）
- 非功能性需求
- 技术考虑
- 项目规划
- 成功指标与风险

### **0.3 外部AI输出集成到项目**

**步骤1：保存外部AI输出**
1. 复制外部AI生成的完整产品需求文档
2. 在本项目中创建文件：`project_docs/REQUIREMENTS/EXTERNAL_AI_PRODUCT_ANALYSIS.md`
3. 粘贴AI输出，并在文档开头添加元信息：
   ```markdown
   ---
   **导入时间**: [当前时间]
   **导入者**: [您的名称]
   **外部AI来源**: [AI平台名称]
   **协作完成度**: 完整
   **下一步**: 准备与OrchestratorAgent进行项目初始化
   ---
   ```

**步骤2：激活OrchestratorAgent**
参照本指南第1节的说明，配置并激活 `OrchestratorAgent`。

**步骤3：向OrchestratorAgent报告外部AI成果**
使用以下模板向 `OrchestratorAgent` 报告：
```
🎛️ OrchestratorAgent，我已完成外部AI协作阶段，生成了一份详细的产品需求文档。

文档位置：project_docs/REQUIREMENTS/EXTERNAL_AI_PRODUCT_ANALYSIS.md

这份文档包含了：
- 产品名称：[从文档中提取]
- 核心价值：[从文档中提取] 
- 主要功能：[简要列举3-5个核心功能]
- 技术栈建议：[从文档中提取]

请你：
1. 阅读并理解这份外部AI生成的需求文档
2. 将关键信息更新到PROJECT_CONTEXT.md中
3. 根据ACTION_PLAN_MASTER.md规划下一阶段的具体任务
4. 开始指导项目的正式开发流程

我们准备好进入需求细化和架构设计阶段。
```

### **0.4 外部AI协作的注意事项**

- **完整性检查**：确保外部AI输出包含文档底部的"外部AI协作完成: 是"标识
- **质量验证**：如果外部AI输出不完整，请参考 [`EXTERNAL_AI_OUTPUT_INTEGRATION.md`](./EXTERNAL_AI_OUTPUT_INTEGRATION.md) 的处理指导
- **保持开放**：外部AI的建议不是最终决定，`OrchestratorAgent` 和专业AI角色会进一步优化
- **记录过程**：如果可能，保存与外部AI的完整对话记录到 `bak/` 目录

**详细的外部AI协作指导和问题处理**：请参阅 [`EXTERNAL_AI_COLLABORATION_GUIDE.md`](./EXTERNAL_AI_COLLABORATION_GUIDE.md) 和 [`EXTERNAL_AI_OUTPUT_INTEGRATION.md`](./EXTERNAL_AI_OUTPUT_INTEGRATION.md)。

---

## **1. 快速上手：启动您的AI项目伙伴**

本节将引导您完成项目的初始设置并激活核心的 `OrchestratorAgent`。

### **1.1 环境准备与配置**

确保您的开发环境满足以下基本要求：

*   **Cursor IDE**: 本框架设计与Cursor紧密集成。
*   **Node.js**: `PromptX` 框架可能依赖Node.js执行其脚本（例如，`bootstrap.md` 中提到的 `promptx.js`）。请确保已安装Node.js。
*   **项目文件**: 您已获得本项目的完整副本，包括 `PromptX/` 和 `project_docs/` 目录。

### **1.2 核心：理解与配置 `PromptX` 和 `OrchestratorAgent`**

`PromptX` 是一个工程化的AI提示词管理框架，用于定义和管理AI角色。`OrchestratorAgent` 是本项目的"总指挥AI"。

**关键步骤** (详细技术细节请参考 [`PROMPTX_USAGE_GUIDE.md`](./PROMPTX_USAGE_GUIDE.md)):

1.  **确认 `OrchestratorAgent.role.md`**:
    *   确保 `PromptX/domain/custom/OrchestratorAgent.role.md` 文件存在。这是 `OrchestratorAgent` 的角色定义。
2.  **检查 `bootstrap.md` (关键!)**:
    *   打开 `PromptX/bootstrap.md` 文件。
    *   **本项目模板已预先配置此文件**，使其默认加载 `OrchestratorAgent`。您应看到如下行：
        ```
        @file://PromptX/domain/custom/OrchestratorAgent.role.md
        ```
    *   如果此行指向其他角色，请务必将其修改为指向 `OrchestratorAgent.role.md`，以便 `OrchestratorAgent` 作为您首要的交互AI。
3.  **设置Cursor的系统提示词 (System Prompt)**:
    *   将 **`PromptX/bootstrap.md` 文件的全部内容** 复制。
    *   粘贴到Cursor的系统提示词设置区域。
    *   **这是激活 `PromptX` 框架并指定 `OrchestratorAgent` 为主导AI的关键步骤。**
    *   或者，您可以在每次与AI开始新会话时，首先将 `bootstrap.md` 的内容作为第一条消息发送给AI。

### **1.3 激活 `OrchestratorAgent`**

1.  在正确设置了系统提示词（或在会话开始时发送了 `bootstrap.md` 内容）之后，向AI发送一个简单的指令：
    ```
    Action
    ```
2.  此时，`OrchestratorAgent` 将被激活，并准备好接收您的具体任务指令。您应该会看到类似的回应：
    > 🎛️ 项目总指挥AI已激活！...请告诉我您希望完成什么。

### **1.4 您的第一个指令：定义项目**

一旦 `OrchestratorAgent` 激活，就可以开始定义您的项目了。

*   **示例初始指令**：
    ```
    🎛️ OrchestratorAgent，你好！我们现在要启动一个新项目。
    项目名称是："超级订单管理系统"
    核心目标是："开发一个高效、可扩展的在线订单处理平台，整合库存管理和客户通知功能。"
    主要功能模块初步设想包括：用户账户、产品目录、购物车、订单处理、库存跟踪、支付集成、通知服务。
    请开始引导我完成项目的初始化和规划。
    ```
*   `OrchestratorAgent` 将会：
    *   确认收到您的请求。
    *   开始提问以澄清需求（如果需要）。
    *   引导您更新 `project_docs/PROJECT_CONTEXT.md` 中的项目概览、目标等信息。
    *   参照 `project_docs/ACTION_PLAN_MASTER.md` 规划项目的初始阶段。

## **2. 与 `OrchestratorAgent` 高效互动**

`OrchestratorAgent` 是您项目中的核心AI协调员。与其高效沟通至关重要。

### **2.1 清晰、明确、具体的指令 (参考 [`AI_COLLABORATION_BEST_PRACTICES.md`](./AI_COLLABORATION_BEST_PRACTICES.md))**

*   **避免模糊**：
    *   **不佳**: "处理一下用户模块。"
    *   **良好**: "🎛️ OrchestratorAgent，请指导 `DeveloperAI` 为用户认证模块设计数据库表结构，并生成相应的SQL迁移脚本。需求细节请参考 `project_docs/REQUIREMENTS/FSD.md` 第3.1节。技术栈使用PostgreSQL。"
*   **提供上下文**:
    *   始终引用相关文档、决策或代码。`OrchestratorAgent` 依赖这些信息进行准确判断。
    *   您可以提示它参考 `project_docs/PROJECT_CONTEXT.md` 获取项目当前状态和关键信息。
*   **明确目标和产出物**:
    *   清晰说明您期望AI完成什么，以及期望的交付形式（如："生成Python代码文件 `services/user_service.py`"，"更新 `API_DOCUMENTATION.md` 中关于用户注册的API描述"）。
*   **分解复杂任务**:
    *   对于大型任务，最好由 `OrchestratorAgent` 协助分解成更小的子任务，然后逐步完成。

### **2.2 理解 `OrchestratorAgent` 的核心职责 (参考 [`OrchestratorAgent_Directives.md`](./OrchestratorAgent_Directives.md))**

`OrchestratorAgent` 的主要工作不是自己编写大量代码或文档，而是：

*   **理解您的需求**。
*   **规划项目阶段和任务** (依据 `ACTION_PLAN_MASTER.md`)。
*   **分析任务并推荐/协助创建最合适的专业AI角色** (如 `ProductOwnerAI`, `DeveloperAI`, `TesterAI` 等)。
*   **指导您进行AI角色切换**。
*   **维护项目核心上下文** (更新 `PROJECT_CONTEXT.md`)。
*   **追踪项目进度** (更新 `AI_AGENT_PROGRESS.md`)。
*   **解决协作流程中的问题**。

### **2.3 指令示例**

*   **启动新阶段**:
    *   "🎛️ OrchestratorAgent，需求分析阶段已完成，`FSD.md` 已更新。请规划接下来的架构设计阶段。"
*   **查询项目状态**:
    *   "🎛️ OrchestratorAgent，目前项目的整体进度如何？哪些任务是当前瓶颈？" (它会参考 `AI_AGENT_PROGRESS.md`)
*   **请求特定操作**:
    *   "🎛️ OrchestratorAgent，请让 `TechnicalWriterAI` 根据 `src/api/auth.py` 中的代码注释，更新API文档中用户登录和注册部分。" (这通常需要先切换到 `TechnicalWriterAI`)
*   **讨论技术选型或方案**:
    *   "🎛️ OrchestratorAgent，关于用户密码加密存储，我们是应该使用 bcrypt 还是 Argon2？请分析其优缺点并给出建议，然后让 `SystemArchitectAI` 更新到技术选型文档。"

## **3. 掌握AI角色切换**

角色切换是本框架的核心机制，旨在让最擅长特定任务的AI来处理它。

### **3.1 为何需要角色切换？**

*   不同的软件开发任务（需求、设计、编码、测试、文档）需要不同的专业技能。
*   `PromptX` 允许我们为每种技能定义专门的AI角色。
*   `OrchestratorAgent` 通过分析任务，推荐最合适的角色，以提高工作质量和效率。

### **3.2 `OrchestratorAgent` 如何指导角色切换**

当 `OrchestratorAgent` 判断当前任务需要特定专业角色时，它会：

1.  **明确告知您**：它会解释为什么需要切换，以及推荐哪个角色。
    *   **示例**: "对于当前任务'编写用户故事'，我推荐使用 `ProductOwnerAI` 角色 (定义于 `@file://PromptX/domain/custom/ProductOwnerAI.role.md`)。它更擅长从用户视角梳理需求。"
2.  **提供切换指令**: 它会告诉您如何修改 `PromptX/bootstrap.md`。

### **3.3 您的操作：执行角色切换 (参考 [`PROMPTX_USAGE_GUIDE.md`](./PROMPTX_USAGE_GUIDE.md))**

1.  **打开 `PromptX/bootstrap.md` 文件。**
2.  **修改角色引用行**：将 `@file://` 后面的路径修改为 `OrchestratorAgent` 指定的新角色文件路径。
    *   例如，从 `PromptX/domain/custom/OrchestratorAgent.role.md` 改为 `PromptX/domain/custom/ProductOwnerAI.role.md`。
3.  **保存 `bootstrap.md` 文件。**
4.  **更新Cursor的系统提示词**: 如果您是将 `bootstrap.md` 的内容复制到系统提示词区域的，请用修改后的新内容替换掉旧的系统提示词。
5.  **重新发送 "Action" 指令给AI**: 这是激活新AI角色的关键。
    ```
    Action
    ```
6.  **向新角色下达任务**: 新角色激活后，`OrchestratorAgent` (或您自己) 需要向它提供明确的任务指令和必要的上下文。
    *   `OrchestratorAgent` 通常会提示您应该给新角色什么初始指令。
    *   **示例 (切换到 `ProductOwnerAI` 后)**: "`ProductOwnerAI`，你好。请根据我们上次与 `OrchestratorAgent` 讨论的关于'超级订单管理系统'的核心功能，开始编写详细的用户故事。请将用户故事输出到 `project_docs/REQUIREMENTS/USER_STORIES.md`。"

### **3.4 切换回 `OrchestratorAgent`**

当专业AI角色完成其特定任务后，您通常需要切回 `OrchestratorAgent`，以便：

*   向它汇报任务成果。
*   由它来规划下一步。
*   确保 `PROJECT_CONTEXT.md` 和 `AI_AGENT_PROGRESS.md` 得到更新。

切换方法同上，只需将 `PromptX/bootstrap.md` 中的角色路径改回 `@file://PromptX/domain/custom/OrchestratorAgent.role.md`，更新系统提示词，并重发 "Action"。

### **3.5 创建新AI角色**

在项目执行过程中，可能需要当前角色库中不存在的全新AI角色以应对特定任务。本框架支持灵活的角色创建：

1.  **`OrchestratorAgent` 引导创建**:
    *   `OrchestratorAgent` 会分析任务需求，并在必要时向您解释为何需要新角色及其应具备的核心能力。
    *   它会指导您切换到 `PromptX/domain/prompt/prompt-developer.role.md` (提示词开发者角色)，并提供详细的需求描述，协助您创建新的 `.role.md` 文件。新角色通常存放于 `PromptX/domain/custom/`。

2.  **手动/外部创建角色的集成**:
    *   如果您通过其他方式（如手动编写或使用PromptX的beta工具）创建了新的 `.role.md` 文件，您需要主动告知 `OrchestratorAgent` 新角色的文件路径及其核心功能。
    *   这样，`OrchestratorAgent` 才能将这个新角色纳入其管理和推荐范围。

**详细操作步骤**：关于以上两种创建和集成新AI角色的完整、详细的操作步骤，请参阅 **[`project_docs/PROMPTX_USAGE_GUIDE.md`](./PROMPTX_USAGE_GUIDE.md) 的第5节和第6节**。该指南提供了具体指令和注意事项。

一旦新角色被创建并成功集成（`OrchestratorAgent` 已知晓），您就可以通过标准的角色切换机制（修改 `bootstrap.md`，更新系统提示词，重发 "Action"）来激活并使用这个新角色了。

## **4. 项目监督：监控进度与审查AI产出**

有效的监督是确保AI项目成功的关键。

### **4.1 使用 `PROJECT_CONTEXT.md` 掌握全局**

*   **这是项目的"单一事实来源"**。
*   `OrchestratorAgent` 负责动态维护此文件，记录：
    *   项目概览、目标、当前阶段。
    *   关键决策与里程碑。
    *   **核心项目文档索引 (非常重要!)**: 所有重要文档的最新路径和描述。这是您查找任何项目文档的起点。
    *   技术栈概要。
    *   主要模块列表与状态。
    *   当前面临的关键问题或挑战。
*   **您的行动**:
    *   **定期查阅**: 了解项目最新动态。
    *   **核对信息**: 确保其内容与您的理解一致。如有偏差，及时与 `OrchestratorAgent`沟通。
    *   **依赖索引**: 在查找项目文档时，优先使用此文件中的链接，以避免找到过时或错误版本的文件。

### **4.2 使用 `AI_AGENT_PROGRESS.md` 追踪任务**

*   这是AI维护的项目进度看板。
*   它包含：
    *   项目总体进度概览。
    *   主要阶段与任务的状态、负责人、起止日期、阻塞项。
    *   当前活动与下一步计划。
    *   需要用户关注或输入的事项 (例如，等待您确认某个文档)。
    *   风险与问题跟踪。
*   **您的行动**:
    *   **每日/定期检查**: 了解具体任务的进展情况。
    *   **关注"需要用户关注"**: 及时提供AI需要的输入或决策。
    *   **识别瓶颈**: 如果某个任务长时间"受阻(Blocked)"或"进行中(In Progress)"但无实际进展，请与 `OrchestratorAgent` 讨论。

### **4.3 审查AI的产出物**

AI生成的代码、文档等所有产出物都需要您的审查和确认。

*   **代码审查**:
    *   **正确性**: 代码是否实现了预期的功能？
    *   **完整性**: 是否处理了所有边缘情况和错误条件？
    *   **可读性与可维护性**: 代码风格是否一致？注释是否清晰？结构是否合理？
    *   **安全性**: 是否存在已知的安全漏洞？
    *   **性能**: 是否有效率问题？（根据需求判断）
    *   **测试**: 是否伴随有单元测试？测试覆盖率如何？
    *   **工具**: 可以让AI辅助生成代码审查点，或者使用静态分析工具。
*   **文档审查**:
    *   **准确性**: 内容是否准确反映了需求、设计或实际情况？
    *   **完整性**: 是否覆盖了所有必要的信息点？
    *   **清晰度**: 是否易于理解？术语使用是否一致？
    *   **格式**: 是否符合项目规范或模板？
*   **反馈给AI**:
    *   **具体化**: 不要只说"不好"，要指出具体问题所在。
    *   **提供修正建议**: 如果可能，给出您期望的修改方向。
    *   **要求重新生成**: 在提供清晰反馈后，可以要求AI重新生成或修改。
        *   **示例**: "`DeveloperAI`，你生成的 `user_service.py` 中，`create_user` 函数没有对密码进行哈希处理，这不安全。请使用 bcrypt 对密码加盐哈希后存储。另外，请为该函数补充单元测试，确保覆盖密码哈希的逻辑。"

## **5. 故障排除与获取帮助**

### **5.1 常见问题与排查**

*   **AI未按预期激活/角色未切换成功**:
    *   **检查 `PromptX/bootstrap.md`**: 确保 `@file://` 指令指向正确的 `.role.md` 文件。
    *   **检查Cursor系统提示词**: 确认已将 `bootstrap.md` 的最新内容完整复制并设置。
    *   **是否发送了 "Action" 指令?**: 每次修改 `bootstrap.md` 或系统提示词后，都需要重发 "Action"。
*   **AI似乎不理解您的指令**:
    *   **指令是否清晰、具体？** (回顾2.1节)
    *   **是否提供了足够的上下文？**
    *   **尝试换一种方式表达。**
*   **AI产出质量不高**:
    *   **输入质量**: 您提供的需求/设计是否清晰准确？(Garbage In, Garbage Out)
    *   **AI角色是否合适**: 当前角色是否是执行该任务的最佳选择？可以与 `OrchestratorAgent` 讨论。
    *   **迭代与反馈**: AI需要通过您的反馈来学习和改进。耐心指导，多次迭代。
*   **`PROJECT_CONTEXT.md` 或 `AI_AGENT_PROGRESS.md` 更新不及时/不准确**:
    *   立即向 `OrchestratorAgent` 指出问题，要求其修正。例如："🎛️ OrchestratorAgent，`PROJECT_CONTEXT.md` 中关于支付模块的技术选型记录不正确，请更新为我们昨天讨论的方案。"

### **5.2 首先向 `OrchestratorAgent` 求助**

*   `OrchestratorAgent` 被设计为能够理解和协助解决许多与项目流程、AI协作相关的问题。
*   **示例**:
    *   "🎛️ OrchestratorAgent，我不确定接下来应该做什么，请给出建议。"
    *   "🎛️ OrchestratorAgent，`DeveloperAI` 生成的代码似乎没有遵循我们在 `TECHNICAL_STACK.md` 中定义的技术规范，请核实。"
    *   "🎛️ OrchestratorAgent，我应该如何为这个项目配置前端测试框架？请推荐一个合适的AI角色来协助我。"

### **5.3 查阅项目文档**

*   本指南、[`README_USER.md`](./README_USER.md)、[`PROMPTX_USAGE_GUIDE.md`](./PROMPTX_USAGE_GUIDE.md) 和 [`AI_COLLABORATION_BEST_PRACTICES.md`](./AI_COLLABORATION_BEST_PRACTICES.md) 包含了大量有用的信息。

## **6. 理解本文档生态系统**

本项目包含一套精心设计的文档，以支持AI与人的高效协作。

*   **本指南 (`COMPREHENSIVE_PROJECT_GUIDE.md`)**: 您的首要日常操作手册，整合和串联了其他文档的核心操作信息。
*   **[`README_USER.md`](./README_USER.md)**: 项目的初始入口和概念总览。解释"为什么"和"是什么"。
*   **[`PROMPTX_USAGE_GUIDE.md`](./PROMPTX_USAGE_GUIDE.md)**: `PromptX` 配置和AI角色切换的技术细节。
*   **[`AI_COLLABORATION_BEST_PRACTICES.md`](./AI_COLLABORATION_BEST_PRACTICES.md)**: 与AI协作的通用技巧和心法 (其核心内容已融入本指南)。
*   **[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)**: 项目的动态"大脑"，实时更新项目状态、决策和文档索引。
*   **[`OrchestratorAgent_Directives.md`](./OrchestratorAgent_Directives.md)**: `OrchestratorAgent` 的"使命宣言"和核心行为准则。帮助您理解其行为逻辑。
*   **[`AI_AGENT_PROGRESS.md`](./AI_AGENT_PROGRESS.md)**: 项目任务级的进度跟踪看板。
*   **[`TASK_LIST_TEMPLATE.md`](./TASK_LIST_TEMPLATE.md)**: AI生成具体任务列表时参考的模板。
*   **[`ACTION_PLAN_MASTER.md`](./ACTION_PLAN_MASTER.md)**: 项目从启动到交付的高级战略路线图，指导 `OrchestratorAgent` 的宏观调控。
*   **`PromptX/` 目录中的 `.role.md` 文件**: 定义了各个AI角色的具体能力和行为。

**协作流程**: 您通过本指南学习如何操作 -> 与 `OrchestratorAgent` 交互 -> `OrchestratorAgent` 参考其指令和项目计划，并与其他AI角色协作 -> AI的活动和产出反映在 `PROJECT_CONTEXT.md`、`AI_AGENT_PROGRESS.md` 及各类项目文件中 -> 您通过这些文档和直接审查来监督和验证。

---

我们致力于打造一个顺畅、高效的AI协作体验。祝您项目顺利！
如果您有任何反馈或建议来改进本指南或整个框架，请随时提出。 