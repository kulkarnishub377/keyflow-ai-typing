# 04 - Local Model Adapter Workflow

**Trigger**: When the user requests to implement Stage 3 (Local Models).

## Steps

1. **Provider Abstraction**: Create a base class `LocalModelProvider` in Python with a `generate(task, structured_context)` method.
2. **Privacy Filter**: Before calling the model, run a strict privacy filter function to strip local metadata, database paths, and PII from the `structured_context`.
3. **Integration**: Inject the provider into a specific agent (e.g., `Coach`). The agent should only call the model if deterministic rules fall short, or it uses the model to synthesize the final string based on deterministic evidence.
4. **Schema Enforcement**: Implement JSON parsing. If the model fails to return valid JSON matching the schema, it must throw an error, caught by the agent, which then falls back to a hardcoded string.
5. **No Internet**: Ensure the integration utilizes a local inference server (like LM Studio, llama.cpp, or Ollama) and never OpenAI/Anthropic endpoints in production.
