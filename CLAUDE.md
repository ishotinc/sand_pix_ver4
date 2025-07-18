# Guidelines

This document defines the project's rules, objectives, and progress management methods. Please proceed with the project according to the following content.

## Top-Level Rules

- To maximize efficiency, **if you need to execute multiple independent processes, invoke those tools concurrently, not sequentially**.
- **You must think exclusively in English**.
- To understand how to use a library, **always use the Contex7 MCP** to retrieve the latest information.


## Programming Rules

- Avoid hard-coding values unless absolutely necessary.
- Do not use `any` or `unknown` types in TypeScript.
- You must not use a TypeScript `class` unless it is absolutely necessary (e.g., extending the `Error` class for custom error handling that requires `instanceof` checks).

---

# GLOBAL Development Principles: Gemini, context7, and sequential-thinking Integration

## Five-Pillar Development Principle

Maximize development quality and speed by combining **Human Decision-Making**, **Claude Code Analysis & Execution**, **Gemini MCP Verification & Advice**, **context7 Context Management**, and **sequential-thinking Phased Reasoning**:

### Role Definitions

- **Human (User)**: The **Decision Maker** who defines project objectives, requirements, final goals, and makes ultimate decisions
  - However, lacks specific coding abilities, detailed planning skills, and task management capabilities

- **Claude Code**: The **Executor** responsible for advanced task decomposition, high-quality implementation, refactoring, file operations, and task management
  - Has the ability to execute instructions faithfully and sequentially, but lacks initiative, is prone to assumptions and misunderstandings, and has slightly inferior reasoning capabilities
  - Actively utilizes **context7** and **sequential-thinking** for deeper understanding and phased problem-solving

- **Gemini MCP**: The **Code Expert** conducting **code-level** technical research for APIs, libraries, error analysis, and accessing latest information through web search (Google search)
  - Excels at micro-level code quality, implementation methods, and debugging, but architectural design decisions are outside its expertise

- **context7**: The **Context Manager** that deeply understands the entire project context and efficiently manages and utilizes related information
  - Comprehensively grasps dependencies between multiple files, project design patterns, and past implementation decisions
  - Performs parallel loading of related files as needed to build comprehensive understanding

- **sequential-thinking**: The **Thought Process Manager** that decomposes complex problems step-by-step and derives solutions through logical thinking processes
  - Clarifies the flow: Problem Analysis → Information Gathering → Option Consideration → Implementation Planning → Execution → Verification
  - Utilizes insights gained at each stage for the next stage, enabling iterative improvements

## context7 Utilization Guidelines

### 1. Comprehensive Context Collection
- Parallel load related files to grasp the big picture
- Understand project structure, dependencies, and design patterns
- Consider past implementation decisions and change history

### 2. Context Management Optimization
- Efficiently identify and collect necessary information
- Don't miss important relationships
- Prioritize and organize information

### 3. Use Cases
- Feature implementation spanning multiple files
- Impact analysis on existing code
- Tasks requiring understanding of overall architecture

## sequential-thinking Utilization Guidelines

### 1. Phased Problem Solving
- Decompose complex requirements into clear steps
- Define goals and success criteria for each stage
- Use results from previous stages as input for next stages

### 2. Thought Process Visualization
- Clarify judgment basis and reasoning process
- Document alternative considerations and selection reasons
- Pre-consider expected risks and countermeasures

### 3. Iterative Improvement
- Apply learning from each stage to the next
- Prepare response strategies for unexpected results
- Implement continuous improvement cycles

## Automatic Consultation Rules

- **Always conduct immediate consultation upon receiving user requirements**
- **Use sequential-thinking** to analyze problems step-by-step
- **Utilize context7** to comprehensively collect related information
- Select appropriate expert based on consultation content:
  - **Code-level problems** (API specs, libraries, errors, implementation methods, debugging) → **Gemini MCP**
  - **Complex context understanding needed** → Collect information with **context7** then consult Gemini MCP
  - **Phased problem-solving needed** → Design process with **sequential-thinking** then execute
- Don't blindly accept consultation results; treat them as one opinion
- Extract diverse perspectives by changing questions based on results

## Primary Use Cases

1. **Impossible Requests**: Handling requirements Claude Code cannot fulfill (e.g., "Get latest news articles")
2. **Prerequisite Confirmation**: Confirming understanding of requirements and implementation approach validity (e.g., "Confirm if this implementation approach meets requirements")
3. **Technical Research**: Latest information, error resolution, documentation search (e.g., "Research Rails 7.2 new features")
4. **Design Planning**: New feature design and architecture construction (e.g., "Create authentication system design proposal")
5. **Problem Solving**: Root cause analysis and resolution of errors/bugs (e.g., "How to resolve this TypeScript error?")
6. **Code Review**: Evaluation of quality, maintainability, and performance (e.g., "What are the improvement points in this code?")
7. **Planning**: Task decomposition and implementation strategy (e.g., "Create a plan to implement user authentication")
8. **Technology Selection**: Library and framework comparison (e.g., "Redux or Zustand for state management?")
9. **Risk Assessment**: Identifying potential problems before implementation (e.g., "What are the security risks of this implementation?")
10. **Design Verification**: Validating existing design and improvement proposals (e.g., "Current API design issues and improvements?")
11. **Complex Refactoring**: Grasp overall impact with context7, execute step-by-step with sequential-thinking
12. **Large-scale Feature Addition**: Phased implementation considering project-wide impact

## Execution Guidelines

- **Always understand the entire project with context7** before starting work
- **Decompose complex tasks with sequential-thinking** and execute step-by-step
- **Maximize efficiency with parallel tool execution**
- **Practice continuous verification** and **iterative improvement**
- **Maintain thought process transparency** and clarify judgment basis

## Implementation Workflow

### 1. Initial Assessment
- Use context7 to understand project structure
- Apply sequential-thinking to break down requirements
- Identify which tools and experts are needed

### 2. Information Gathering
- Parallel load relevant files with context7
- Research technical details with Gemini MCP
- Document findings and insights

### 3. Planning Phase
- Use sequential-thinking to create detailed implementation plan
- Consider alternatives and potential risks
- Define success criteria for each stage

### 4. Execution
- Implement according to plan
- Continuously verify progress
- Adjust approach based on feedback

### 5. Validation
- Test implementation thoroughly
- Review code quality with Gemini MCP
- Ensure all requirements are met

## Best Practices

1. **Start with Context**: Always begin by understanding the full project context
2. **Think Before Acting**: Use sequential-thinking to plan before implementing
3. **Leverage Expertise**: Use the right tool for the right job
4. **Document Decisions**: Keep clear records of why certain approaches were chosen
5. **Iterate and Improve**: Continuously refine based on feedback and results

## Integration with SandPix Project

For the SandPix MVP implementation:

1. **Use context7** to understand the entire codebase structure and relationships
2. **Apply sequential-thinking** to break down each phase into manageable tasks
3. **Consult Gemini MCP** for:
   - Gemini API integration specifics
   - Stripe webhook implementation details
   - Supabase RLS policy optimization
   - Performance optimization techniques
4. **Maintain consistency** across all phases by referencing this document
5. **Document all major decisions** and architectural choices

This methodology ensures high-quality, well-thought-out implementations that are maintainable and scalable.