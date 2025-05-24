# **提示词开发者指南：创建符合规范的AI角色 (`PROMPT_DEVELOPER_GUIDELINES.md`)**

**目的**: 本指南为提示词开发者（或协助创建AI角色的 `OrchestratorAgent`）提供规范，确保所有新创建的专业AI角色都能无缝集成到由 `OrchestratorAgent` 主导的项目协作流程中。遵循这些规范对于维护项目管理的统一性、清晰度和效率至关重要。

**版本**: 1.0
**最后更新**: `{{YYYY-MM-DD}}`

## **核心原则**

1.  **`OrchestratorAgent` 主导**: 所有专业AI角色都是在 `OrchestratorAgent` 的统一协调下工作的执行单元。
2.  **明确的单向任务流**: `OrchestratorAgent` 分配任务 -> 专业AI角色执行并汇报 -> `OrchestratorAgent` 评估并规划下一步。
3.  **状态管理唯一性**: `AI_AGENT_PROGRESS.md` 和 `PROJECT_CONTEXT.md` 由 `OrchestratorAgent` **独家更新和维护**。专业AI角色只负责报告其任务产出和状态。

## **新AI角色定义文件 (`*.role.md`) 规范**

所有新创建的AI角色定义文件（通常位于 `PromptX/domain/custom/` 或相关领域子目录下）必须遵循以下结构和内容要求：

### **1. 角色描述 (`<description>`)**

*   清晰说明角色的核心职责和专业领域。
*   **必须提及**该角色是在 `OrchestratorAgent` 的指导下执行特定任务的。
    *   例如："本角色是一名[专业领域]AI，负责[核心职责]。它接收来自 `OrchestratorAgent` 的任务指令，并在完成后向其汇报。"

### **2. 原则 (`<principle>`)**

*   **必须包含**一条指导原则，强调参考 `project_docs/PROJECT_CONTEXT.md` 以获取项目上下文。
*   **必须包含**一条指导原则，强调其行动和汇报需遵循 `OrchestratorAgent` 的协调。

### **3. 行动块 (`<action>`)**

#### **A. 任务接收行动块**

*   角色必须有一个或多个清晰定义的 `<block>` 用于接收来自 `OrchestratorAgent` 的核心任务指令。
*   这些块应包含明确的 `<input>` 参数，用于接收任务详情、所需数据路径等。
*   **示例**:
    ```xml
    <action>
        <block name="execute_core_task">
            <description>接收并执行[角色专业领域]的核心任务。</description>
            <input name="task_details" type="string" description="来自OrchestratorAgent的具体任务描述"/>
            <input name="input_document_path" type="string" optional="true" description="任务所需的输入文档路径"/>
            <!-- 其他必要的输入 -->
            <output name="output_summary" type="string" description="任务执行的简要总结"/>
            <output name="output_artifact_paths" type="string" description="主要产出物路径列表 (逗号分隔)"/>
            <execute>
                print(f"正在执行核心任务: {task_details}...");
                // ... 角色执行任务的逻辑 ...
                // 产出物应保存到项目结构中合适的位置
                // self.output_summary = "核心任务已按要求完成。";
                // self.output_artifact_paths = "project_docs/section/output1.md,src/module/code.js";
                print("核心任务执行完毕。准备向 OrchestratorAgent 汇报。");
            </execute>
        </block>
        <!-- 其他特定任务的行动块 -->
    </action>
    ```

#### **B. 任务完成汇报行动块 (`report_to_orchestrator`)**

*   **必须包含**一个名为 `report_to_orchestrator` (或类似且功能一致的名称) 的标准行动块。
*   此块的职责是向 `OrchestratorAgent` 报告任务完成情况。
*   **输入参数应包括**:
    *   `task_description`: 已完成的核心任务描述。
    *   `outputs_description`: 主要产出物及其在项目中的完整路径的清晰描述。
    *   `status_summary`: 任务执行的简要总结。
    *   `issues_or_blockers` (可选): 遇到的任何问题或阻塞项。
*   **执行逻辑 (`<execute>`) 必须**:
    1.  清晰打印任务已完成。
    2.  清晰打印主要产出物及其路径。
    3.  清晰打印状态总结和任何问题。
    4.  **最重要**: **明确输出一个标准的接管信号**，例如:
        `print("请 OrchestratorAgent 接管并评估产出，进行下一步规划。");`
*   **示例 (参考 `DevOpsEngineerAI.role.md` 中的 `report_to_orchestrator` 块)**:
    ```xml
    <block name="report_to_orchestrator">
        <description>向OrchestratorAgent汇报核心任务的完成情况、主要产出物及其路径、遇到的问题或需要协调的事项，并明确请求OrchestratorAgent接管进行下一步评估和规划。</description>
        <input name="task_description" type="string" description="已完成的核心任务描述"/>
        <input name="outputs_description" type="string" description="主要产出物及其路径的描述"/>
        <input name="status_summary" type="string" description="当前状态和成果的简要总结"/>
        <input name="issues_or_blockers" type="string" optional="true" description="遇到的问题或阻塞项"/>
        <execute>
            print(f"任务 '{task_description}' 已完成。");
            print(f"主要产出: {outputs_description}");
            print(f"状态总结: {status_summary}");
            if issues_or_blockers:
                print(f"遇到的问题/阻塞项: {issues_or_blockers}");
            print("请 OrchestratorAgent 接管并评估产出，进行下一步规划。");
        </execute>
    </block>
    ```

### **4. 思考过程 (`<thought_process>`)**

*   **最后一步必须是**: 调用标准的 `report_to_orchestrator` 行动块，以确保任务完成后总是向 `OrchestratorAgent` 汇报。
    *   例如: `<step>使用 "report_to_orchestrator" 行动块，清晰汇报任务完成情况、产出物和遇到的任何问题，并明确请求 OrchestratorAgent 接管。</step>`

### **5. 内存/资源访问 (`<memory>`)**

*   **禁止写入核心状态文件**:
    *   `project_docs/AI_AGENT_PROGRESS.md`：**禁止**授予 `write` 或 `append` 权限。
    *   `project_docs/PROJECT_CONTEXT.md`：**禁止**授予 `write` 或 `append` 权限。
    *   如果角色需要了解项目进度或上下文，可以授予对这两个文件的 `read` 权限。
*   **明确声明所需资源**: 清晰列出角色执行其任务所需的其他文件或目录的访问权限（读、写、追加等）。
*   **示例**:
    ```xml
    <memory>
        <resource name="project_context" type="file" path="project_docs/PROJECT_CONTEXT.md" access="read"/>
        <resource name="orchestrator_directives" type="file" path="project_docs/OrchestratorAgent_Directives.md" access="read"/>
        <!-- 其他角色特定的只读资源 -->

        <resource name="role_specific_output_dir" type="directory" path="project_docs/role_outputs/[RoleName]/" access="read_write"/>
        <!-- 其他角色特定的读写资源 -->
    </memory>
    ```

## **集成到 OrchestratorAgent 流程中**

`OrchestratorAgent` 在其指令 (`OrchestratorAgent_Directives.md`) 中已被告知：
*   如何选择和激活专业AI角色。
*   如何向它们分配任务。
*   期望从它们那里接收标准的任务完成信号和产出物报告。
*   在接收到报告后，如何验证产出、更新核心状态文件 (`AI_AGENT_PROGRESS.md`, `PROJECT_CONTEXT.md`) 并规划下一步。

提示词开发者在创建新角色时，务必确保新角色遵循本指南，以便顺利融入这一协作流程。

## **审查与验证**

在创建或修改AI角色后，请对照本指南进行审查，确保所有规范都已满足。可以模拟一次 `OrchestratorAgent` 分配任务 -> 新角色执行 -> 新角色汇报 的完整流程，以验证其行为符合预期。

---
本指南旨在促进AI协作的标准化和高效化。 